/**
 * FILE: ragService.ts
 * PURPOSE: Retrieval-Augmented Generation — queryable knowledge from markdown files
 * DEPENDENCIES: knowledgeChunker.ts, geminiService.ts, supabaseClient.ts
 *
 * Two modes:
 * - Gemini Embeddings (when API key is set): semantic vector search
 * - Keyword Fallback (no API key): simple token matching
 *
 * HYBRID: works in-memory always, syncs to Supabase when configured.
 */

import type { KnowledgeChunk } from './knowledgeChunker';
import { chunkMarkdown, KNOWLEDGE_FILES } from './knowledgeChunker';
import { getEmbedding, isAIConfigured, sendBrainMessage } from './geminiService';
import { getSupabase, isSupabaseConfigured } from './supabaseClient';

// #region Types

/** A chunk with its embedding vector */
interface IndexedChunk extends KnowledgeChunk {
  /** Embedding vector (from Gemini text-embedding-004) */
  embedding: number[];
}

/** RAG initialization status */
export type RAGStatus = 'idle' | 'indexing' | 'ready' | 'error' | 'fallback';

// #endregion

// #region State

/** In-memory index of all knowledge chunks with embeddings */
let indexedChunks: IndexedChunk[] = [];

/** Current RAG status */
let ragStatus: RAGStatus = 'idle';

/** Raw knowledge chunks (without embeddings, for keyword fallback) */
let rawChunks: KnowledgeChunk[] = [];

// #endregion

// #region Knowledge File Loading

/**
 * Load all knowledge markdown files as raw text.
 * Uses Vite's import.meta.glob for dynamic loading at build time.
 *
 * @returns Map of filename → content
 */
async function loadKnowledgeFiles(): Promise<Record<string, string>> {
  // Vite glob: path relative to project root
  const modules = import.meta.glob('/../knowledge/*.md', {
    query: '?raw',
    import: 'default',
  });

  const result: Record<string, string> = {};

  for (const [path, loader] of Object.entries(modules)) {
    const filename = path.split('/').pop() || '';
    if (KNOWLEDGE_FILES.includes(filename as typeof KNOWLEDGE_FILES[number])) {
      try {
        const content = await loader() as string;
        result[filename] = content;
      } catch (err) {
        console.warn(`[RAG] Failed to load ${filename}:`, err);
      }
    }
  }

  // Fallback if no files loaded (glob might not work depending on Vite config)
  if (Object.keys(result).length === 0) {
    console.warn('[RAG] No knowledge files loaded via glob. RAG will use fallback mode.');
  }

  return result;
}

// #endregion

// #region Initialization

/**
 * Initialize the RAG system — chunk knowledge files and generate embeddings.
 * Safe to call multiple times; will skip if already ready.
 *
 * @returns Current RAG status after initialization
 */
export async function initializeRAG(): Promise<RAGStatus> {
  if (ragStatus === 'ready' || ragStatus === 'indexing') return ragStatus;

  ragStatus = 'indexing';
  console.log('[RAG] 🔄 Initializing knowledge index...');

  try {
    // Step 1: Load and chunk all knowledge files
    const files = await loadKnowledgeFiles();
    rawChunks = [];

    for (const [filename, content] of Object.entries(files)) {
      const chunks = chunkMarkdown(content, filename);
      rawChunks.push(...chunks);
    }

    console.log(`[RAG] 📄 Chunked ${Object.keys(files).length} files → ${rawChunks.length} chunks`);

    // Step 2: Try to load embeddings from Supabase cache
    if (isSupabaseConfigured()) {
      const cached = await loadEmbeddingsFromSupabase();
      if (cached && cached.length === rawChunks.length) {
        indexedChunks = cached;
        ragStatus = 'ready';
        console.log('[RAG] ☁️ Loaded embeddings from Supabase cache');
        return ragStatus;
      }
    }

    // Step 3: Generate embeddings with Gemini
    if (isAIConfigured()) {
      indexedChunks = [];
      for (const chunk of rawChunks) {
        try {
          const embedding = await getEmbedding(chunk.content);
          indexedChunks.push({ ...chunk, embedding });
        } catch (err) {
          console.warn(`[RAG] Failed to embed chunk ${chunk.id}:`, err);
          // Use empty embedding for failed chunks
          indexedChunks.push({ ...chunk, embedding: [] });
        }
        // Rate limiting: small delay between API calls
        await new Promise(r => setTimeout(r, 100));
      }

      // Save to Supabase if configured
      if (isSupabaseConfigured()) {
        await saveEmbeddingsToSupabase(indexedChunks);
      }

      ragStatus = 'ready';
      console.log(`[RAG] ✅ Indexed ${indexedChunks.length} chunks with embeddings`);
    } else {
      // No AI key — use keyword fallback
      ragStatus = 'fallback';
      console.log('[RAG] ⚠️ No API key — using keyword fallback mode');
    }

    return ragStatus;
  } catch (err) {
    console.error('[RAG] ❌ Initialization failed:', err);
    ragStatus = 'error';
    return ragStatus;
  }
}

// #endregion

// #region Query

/**
 * Find the most relevant knowledge chunks for a question.
 *
 * @param question - User's question in natural language
 * @param topK - Number of results to return (default: 3)
 * @returns Most relevant knowledge chunks, ranked by relevance
 */
export async function queryKnowledge(question: string, topK = 3): Promise<KnowledgeChunk[]> {
  if (ragStatus === 'ready' && indexedChunks.length > 0) {
    return await semanticSearch(question, topK);
  }

  // Fallback: keyword search
  return keywordSearch(question, topK);
}

/**
 * Full RAG pipeline: question → search → context → Gemini → answer.
 * Returns a knowledge-grounded answer from the Brain.
 *
 * @param question - User's question
 * @returns AI-generated answer grounded in knowledge base
 */
export async function askWithKnowledge(question: string): Promise<string> {
  if (!isAIConfigured()) {
    return 'מפתח ה-API של Gemini לא מוגדר. לא ניתן לענות על שאלות.';
  }

  // Retrieve relevant knowledge
  const relevantChunks = await queryKnowledge(question, 4);

  if (relevantChunks.length === 0) {
    // No knowledge found — answer without context
    return sendBrainMessage([], question);
  }

  // Build knowledge context
  const knowledgeContext = relevantChunks
    .map((chunk, i) => `[מקור ${i + 1}: ${chunk.sourceFile} — ${chunk.sectionTitle}]\n${chunk.content}`)
    .join('\n\n---\n\n');

  // Build RAG prompt
  const ragPrompt = `השתמש בידע הבא כדי לענות על השאלה. אם הידע לא מכיל את התשובה, אמור שאין לך מידע.

═══ ידע רלוונטי מהמוח ═══
${knowledgeContext}
═══ סוף ידע ═══

שאלה: ${question}`;

  return sendBrainMessage([], ragPrompt);
}

/**
 * Get the current RAG status.
 */
export function getRAGStatus(): RAGStatus {
  return ragStatus;
}

/**
 * Get the number of indexed chunks.
 */
export function getChunkCount(): number {
  return ragStatus === 'ready' ? indexedChunks.length : rawChunks.length;
}

// #endregion

// #region Semantic Search

/**
 * Search using cosine similarity on embedding vectors.
 *
 * @param question - Query text
 * @param topK - Number of results
 * @returns Top-K most similar chunks
 */
async function semanticSearch(question: string, topK: number): Promise<KnowledgeChunk[]> {
  try {
    const questionEmb = await getEmbedding(question);
    if (questionEmb.length === 0) return keywordSearch(question, topK);

    // Calculate cosine similarity for each chunk
    const scored = indexedChunks
      .filter(chunk => chunk.embedding.length > 0)
      .map(chunk => ({
        chunk,
        score: cosineSimilarity(questionEmb, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    return scored.map(s => s.chunk);
  } catch {
    return keywordSearch(question, topK);
  }
}

/**
 * Cosine similarity between two vectors.
 *
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Similarity score between -1 and 1
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

// #endregion

// #region Keyword Fallback

/**
 * Simple keyword-based search fallback when embeddings are unavailable.
 *
 * @param question - Query text
 * @param topK - Number of results
 * @returns Top-K matching chunks by keyword overlap
 */
function keywordSearch(question: string, topK: number): KnowledgeChunk[] {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return [];

  const scored = rawChunks.map(chunk => {
    const chunkTokens = new Set(tokenize(chunk.content));
    const matchCount = queryTokens.filter(t => chunkTokens.has(t)).length;
    return { chunk, score: matchCount / queryTokens.length };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(s => s.chunk);
}

/**
 * Tokenize text into lowercase words, filtering out short/common words.
 *
 * @param text - Input text
 * @returns Array of meaningful tokens
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

// #endregion

// #region Supabase Persistence

/**
 * Load cached embeddings from Supabase.
 *
 * @returns Indexed chunks from DB, or null if unavailable
 */
async function loadEmbeddingsFromSupabase(): Promise<IndexedChunk[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('knowledge_embeddings')
      .select('*')
      .order('chunk_index');

    if (error || !data) return null;

    return data.map(row => ({
      id: `${row.source_file}-${row.chunk_index}`,
      content: row.content as string,
      sourceFile: row.source_file as string,
      chunkIndex: row.chunk_index as number,
      sectionTitle: (row.metadata as Record<string, string>)?.sectionTitle || '',
      parentTitle: (row.metadata as Record<string, string>)?.parentTitle || '',
      embedding: row.embedding as number[],
    }));
  } catch {
    return null;
  }
}

/**
 * Save embeddings to Supabase for caching.
 *
 * @param chunks - Indexed chunks with embeddings
 */
async function saveEmbeddingsToSupabase(chunks: IndexedChunk[]): Promise<void> {
  const sb = getSupabase();
  if (!sb) return;

  try {
    // Clear existing embeddings
    await sb.from('knowledge_embeddings').delete().neq('id', 0);

    // Insert new ones in batches
    const batchSize = 50;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize).map(chunk => ({
        content: chunk.content,
        source_file: chunk.sourceFile,
        chunk_index: chunk.chunkIndex,
        embedding: chunk.embedding,
        metadata: {
          sectionTitle: chunk.sectionTitle,
          parentTitle: chunk.parentTitle,
        },
      }));

      const { error } = await sb.from('knowledge_embeddings').insert(batch);
      if (error) console.warn('[RAG] Supabase save error:', error.message);
    }

    console.log(`[RAG] ☁️ Saved ${chunks.length} embeddings to Supabase`);
  } catch (err) {
    console.warn('[RAG] Failed to save embeddings to Supabase:', err);
  }
}

// #endregion
