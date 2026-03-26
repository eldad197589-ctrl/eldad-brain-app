/* ============================================
   FILE: ragService.ts
   PURPOSE: ragService module
   DEPENDENCIES: None (local only)
   EXPORTS: RAGStatus, getRAGStatus, getChunkCount
   ============================================ */
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
import { isSupabaseConfigured } from './supabaseClient';
import type { IndexedChunk } from './ragPersistence';
import { loadEmbeddingsFromSupabase, saveEmbeddingsToSupabase } from './ragPersistence';
import { extractFlowchartKnowledge, FLOWCHART_FILES } from './flowchartExtractor';

// #region Types

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

// #region Flowchart Loading

/**
 * Load all flowchart HTML files and extract knowledge as markdown.
 * Uses Vite import.meta.glob for dynamic loading at build time.
 *
 * @returns Map of filename → extracted markdown content
 */
async function loadFlowchartFiles(): Promise<Record<string, string>> {
  const modules = import.meta.glob('/../flowchart-*.html', {
    query: '?raw',
    import: 'default',
  });

  const result: Record<string, string> = {};

  for (const [path, loader] of Object.entries(modules)) {
    const filename = path.split('/').pop() || '';
    if (FLOWCHART_FILES.includes(filename as typeof FLOWCHART_FILES[number])) {
      try {
        const htmlContent = await loader() as string;
        const markdown = extractFlowchartKnowledge(htmlContent, filename);
        if (markdown.length > 50) {
          result[filename] = markdown;
        }
      } catch (err) {
        console.warn(`[RAG] Failed to load flowchart ${filename}:`, err);
      }
    }
  }

  console.log(`[RAG] 📊 Loaded ${Object.keys(result).length} flowchart files`);
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
    // Step 1a: Load and chunk all knowledge markdown files
    const files = await loadKnowledgeFiles();
    rawChunks = [];

    for (const [filename, content] of Object.entries(files)) {
      const chunks = chunkMarkdown(content, filename);
      rawChunks.push(...chunks);
    }

    // Step 1b: Load and chunk flowchart HTML files (extracted to markdown)
    const flowchartFiles = await loadFlowchartFiles();
    for (const [filename, markdownContent] of Object.entries(flowchartFiles)) {
      const chunks = chunkMarkdown(markdownContent, filename);
      rawChunks.push(...chunks);
    }

    const totalSources = Object.keys(files).length + Object.keys(flowchartFiles).length;
    console.log(`[RAG] 📄 Chunked ${totalSources} files (${Object.keys(files).length} md + ${Object.keys(flowchartFiles).length} flowcharts) → ${rawChunks.length} chunks`);

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


// #region Local File Ingestion

/**
 * Ingest new chunks dynamically (e.g., from a user uploading local PDFs/Docx).
 * Generates embeddings and saves to Supabase.
 *
 * @param newChunks - The newly extracted chunks
 * @returns Number of successfully ingested chunks
 */
export async function ingestLocalRawText(newChunks: KnowledgeChunk[]): Promise<number> {
  if (ragStatus !== 'ready') {
    throw new Error('RAG system must be ready before ingesting local files.');
  }

  console.log(`[RAG] 📥 Ingesting ${newChunks.length} new chunks from local files...`);
  
  const newIndexed: IndexedChunk[] = [];
  
  // Generate embeddings for the new chunks
  for (let i = 0; i < newChunks.length; i++) {
    const chunk = newChunks[i];
    
    // Create a deterministic ID
    const id = `local_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`;
    
    // Combine text for embedding
    const textForEmbedding = `${chunk.sourceFile}\n${chunk.parentTitle}\n${chunk.sectionTitle}\n${chunk.content}`;
    
    try {
      const vector = await getEmbedding(textForEmbedding);
      newIndexed.push({
        ...chunk,
        id,
        embedding: vector
      });
    } catch (err) {
      console.warn(`[RAG] Failed to embed local chunk ${i + 1}/${newChunks.length}`, err);
    }
  }

  if (newIndexed.length > 0) {
    // Add to memory
    indexedChunks = [...indexedChunks, ...newIndexed];
    
    // Save to Supabase
    if (isSupabaseConfigured()) {
      await saveEmbeddingsToSupabase(indexedChunks);
      console.log(`[RAG] 💾 Saved ${newIndexed.length} new embeddings to Supabase.`);
    }
  }

  return newIndexed.length;
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

// #region Search (delegated to ragSearch.ts)

import { semanticSearch as _semanticSearch, keywordSearch as _keywordSearch } from './ragSearch';

/**
 * Search using cosine similarity on embedding vectors.
 * Delegates to ragSearch.ts, passing in-memory state.
 */
async function semanticSearch(question: string, topK: number): Promise<KnowledgeChunk[]> {
  return _semanticSearch(question, topK, indexedChunks);
}

/**
 * Keyword-based search fallback.
 * Delegates to ragSearch.ts, passing in-memory state.
 */
function keywordSearch(question: string, topK: number): KnowledgeChunk[] {
  return _keywordSearch(question, topK, rawChunks);
}

// #endregion
