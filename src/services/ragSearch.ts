/* ============================================
   FILE: ragSearch.ts
   PURPOSE: Search implementations for RAG — semantic (vector) and keyword fallback
   DEPENDENCIES: geminiService.ts, knowledgeChunker.ts
   EXPORTS: semanticSearch, keywordSearch, cosineSimilarity, tokenize
   ============================================ */
/**
 * RAG Search — Extracted from ragService.ts for ≤300 line compliance.
 * Contains the core search algorithms: semantic vector search and keyword fallback.
 */

import type { KnowledgeChunk } from './knowledgeChunker';
import type { IndexedChunk } from './ragPersistence';
import { getEmbedding } from './geminiService';

// #region Semantic Search

/**
 * Search using cosine similarity on embedding vectors.
 *
 * @param question - Query text
 * @param topK - Number of results
 * @param indexedChunks - The indexed chunks to search through
 * @returns Top-K most similar chunks
 */
export async function semanticSearch(
  question: string,
  topK: number,
  indexedChunks: IndexedChunk[],
): Promise<KnowledgeChunk[]> {
  try {
    const questionEmb = await getEmbedding(question);
    if (questionEmb.length === 0) return [];

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
    return [];
  }
}

/**
 * Cosine similarity between two vectors.
 *
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Similarity score between -1 and 1
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
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
 * @param rawChunks - Raw chunks to search through
 * @returns Top-K matching chunks by keyword overlap
 */
export function keywordSearch(
  question: string,
  topK: number,
  rawChunks: KnowledgeChunk[],
): KnowledgeChunk[] {
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
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2);
}

// #endregion
