/* ============================================
   FILE: knowledgeChunker.ts
   PURPOSE: knowledgeChunker module
   DEPENDENCIES: None (local only)
   EXPORTS: KnowledgeChunk, chunkMarkdown, KNOWLEDGE_FILES
   ============================================ */
/**
 * FILE: knowledgeChunker.ts
 * PURPOSE: Split markdown knowledge files into searchable chunks for RAG
 * DEPENDENCIES: None (pure functions)
 *
 * Parses markdown files by heading structure, producing chunks suitable
 * for embedding and semantic search.
 */

// #region Types

/** A single chunk of knowledge extracted from a markdown file */
export interface KnowledgeChunk {
  /** Unique ID: sourceFile-chunkIndex */
  id: string;
  /** The text content of the chunk */
  content: string;
  /** Source filename (e.g., 'accounting_knowledge.md') */
  sourceFile: string;
  /** Zero-based index within the source file */
  chunkIndex: number;
  /** Section title (from ## heading) */
  sectionTitle: string;
  /** Parent title (from # heading) */
  parentTitle: string;
}

// #endregion

// #region Constants

/** Target chunk size in characters. Oversized sections are split at paragraph boundaries. */
const TARGET_CHUNK_SIZE = 500;
/** Maximum chunk size before forcing a split */
const MAX_CHUNK_SIZE = 800;

// #endregion

// #region Chunking Logic

/**
 * Split a markdown string into KnowledgeChunks by heading structure.
 *
 * Strategy:
 * 1. Split by ## headings (each section = candidate chunk)
 * 2. Include parent # heading as context prefix
 * 3. Split oversized sections at paragraph boundaries
 *
 * @param markdown - Raw markdown content
 * @param sourceFile - Filename for identification
 * @returns Array of knowledge chunks
 */
export function chunkMarkdown(markdown: string, sourceFile: string): KnowledgeChunk[] {
  const lines = markdown.split('\n');
  const chunks: KnowledgeChunk[] = [];

  let currentParentTitle = sourceFile.replace('.md', '');
  let currentSectionTitle = '';
  let currentContent: string[] = [];
  let chunkIndex = 0;

  const flushSection = () => {
    const text = currentContent.join('\n').trim();
    if (!text || text.length < 20) return;

    const prefix = `# ${currentParentTitle}\n## ${currentSectionTitle}\n`;

    if (text.length <= MAX_CHUNK_SIZE) {
      chunks.push({
        id: `${sourceFile}-${chunkIndex}`,
        content: prefix + text,
        sourceFile,
        chunkIndex,
        sectionTitle: currentSectionTitle || currentParentTitle,
        parentTitle: currentParentTitle,
      });
      chunkIndex++;
    } else {
      // Split oversized section at paragraph boundaries
      const paragraphs = splitAtParagraphs(text, TARGET_CHUNK_SIZE);
      for (const paragraph of paragraphs) {
        chunks.push({
          id: `${sourceFile}-${chunkIndex}`,
          content: prefix + paragraph,
          sourceFile,
          chunkIndex,
          sectionTitle: currentSectionTitle || currentParentTitle,
          parentTitle: currentParentTitle,
        });
        chunkIndex++;
      }
    }
  };

  for (const line of lines) {
    // # Top-level heading → update parent context
    if (line.match(/^# [^#]/)) {
      flushSection();
      currentParentTitle = line.replace(/^# /, '').trim();
      currentSectionTitle = '';
      currentContent = [];
      continue;
    }

    // ## Second-level heading → new section
    if (line.match(/^## /)) {
      flushSection();
      currentSectionTitle = line.replace(/^## /, '').trim();
      currentContent = [];
      continue;
    }

    // ### Third-level heading → include in current section
    currentContent.push(line);
  }

  // Flush remaining content
  flushSection();

  return chunks;
}

/**
 * Split text into paragraph-sized pieces, targeting a size limit.
 *
 * @param text - Text to split
 * @param targetSize - Target size per piece
 * @returns Array of text pieces
 */
function splitAtParagraphs(text: string, targetSize: number): string[] {
  const paragraphs = text.split(/\n\n+/);
  const result: string[] = [];
  let current = '';

  for (const paragraph of paragraphs) {
    if (current.length + paragraph.length > targetSize && current.length > 0) {
      result.push(current.trim());
      current = paragraph;
    } else {
      current += (current ? '\n\n' : '') + paragraph;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

// #endregion

// #region Knowledge File Registry

/**
 * All knowledge files that should be indexed for RAG.
 * These are imported as raw strings at build time.
 */
export const KNOWLEDGE_FILES = [
  // Core brain knowledge
  'MASTER_BRAIN_INSTRUCTIONS.md',
  'eldad_brain_master_knowledge.md',
  // Accounting & Tax
  'accounting_knowledge.md',
  'knowledge_capital_statement.md',
  'knowledge_penalty_cancellation.md',
  // Labor Law
  'knowledge_labor_law.md',
  'labor_law_letters_library.md',
  'labor_law_process_registry.md',
  'labor_law_verified_knowledge.md',
  // Client & Business
  'knowledge_client_onboarding.md',
  'knowledge_business_plan.md',
  'knowledge_smart_bareau_pricing.md',
  // Legal & Agreements
  'knowledge_robium.md',
  'robium_legal_research.md',
  'employment_agreement_template.md',
  'esop_grant_agreement_template.md',
  'esop_incubator_research.md',
  // Seminars
  'knowledge_seminar_tzila.md',
] as const;

// #endregion
