/* ============================================
   FILE: ragPersistence.ts
   PURPOSE: Supabase persistence for RAG knowledge embeddings (load/save cached vectors)
   DEPENDENCIES: supabaseClient
   EXPORTS: loadEmbeddingsFromSupabase, saveEmbeddingsToSupabase
   ============================================ */
import type { KnowledgeChunk } from './knowledgeChunker';
import { getSupabase } from './supabaseClient';

// #region Types

/** A chunk with its embedding vector */
export interface IndexedChunk extends KnowledgeChunk {
  /** Embedding vector (from Gemini text-embedding-004) */
  embedding: number[];
}

// #endregion

// #region Load from Supabase

/**
 * Load cached embeddings from Supabase.
 *
 * @returns Indexed chunks from DB, or null if unavailable
 */
export async function loadEmbeddingsFromSupabase(): Promise<IndexedChunk[] | null> {
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

// #endregion

// #region Save to Supabase

/**
 * Save embeddings to Supabase for caching.
 *
 * @param chunks - Indexed chunks with embeddings
 */
export async function saveEmbeddingsToSupabase(chunks: IndexedChunk[]): Promise<void> {
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
