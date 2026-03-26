/* ============================================
   FILE: flowchartExtractor.ts
   PURPOSE: Extract structured knowledge from flowchart HTML files for RAG
   DEPENDENCIES: None (pure string parsing)
   EXPORTS: extractFlowchartKnowledge, FLOWCHART_FILES
   ============================================ */
/**
 * flowchartExtractor — Parse flowchart HTML → structured markdown
 *
 * The Brain has 14 flowchart HTML files with rich process knowledge.
 * This module extracts the text content from those HTML files
 * and converts them into markdown chunks that RAG can index.
 *
 * Extraction strategy:
 * 1. Parse HTML metadata block (process_id, agents, inputs, outputs)
 * 2. Extract step titles, descriptions, and detail text
 * 3. Extract decision points and branches
 * 4. Produce clean markdown per flowchart
 */

// #region Constants

/** All flowchart HTML files in the project root */
export const FLOWCHART_FILES = [
  'flowchart-attendance.html',
  'flowchart-attendance-agents.html',
  'flowchart-brain-router.html',
  'flowchart-capital-gains.html',
  'flowchart-client-intake.html',
  'flowchart-declaration-of-capital.html',
  'flowchart-expert-opinion.html',
  'flowchart-guardian-pro.html',
  'flowchart-insolvency.html',
  'flowchart-institutional-reports.html',
  'flowchart-payroll-processing.html',
  'flowchart-penalty-cancellation.html',
  'flowchart-war-compensation.html',
  'flowchart-worklaw.html',
] as const;

// #endregion

// #region Metadata Extraction

/**
 * Extract metadata from the HTML comment block at the top of flowcharts.
 *
 * @param html - Raw HTML content
 * @returns Object with process metadata
 */
function extractMetadata(html: string): Record<string, string> {
  const metaBlock = html.match(/╔[^╚]*╚[^>]*/s);
  if (!metaBlock) return {};

  const result: Record<string, string> = {};
  const lines = metaBlock[0].split('\n');

  for (const line of lines) {
    const match = line.match(/║\s*(\w[\w_]*)\s*:\s*(.+?)(?:\s*║|$)/);
    if (match) {
      result[match[1].trim()] = match[2].trim();
    }
  }

  return result;
}

// #endregion

// #region Content Extraction

/**
 * Extract readable text from an HTML string, removing tags and excess whitespace.
 *
 * @param html - HTML fragment
 * @returns Clean text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract step blocks from flowchart HTML.
 * Each step has a title (h2), subtitle, and detail items.
 *
 * @param html - Full HTML content
 * @returns Array of step objects
 */
function extractSteps(html: string): Array<{ title: string; subtitle: string; details: string[] }> {
  const steps: Array<{ title: string; subtitle: string; details: string[] }> = [];

  // Match step cards
  const stepCards = html.match(/<div class="step-card[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g);
  if (!stepCards) return steps;

  for (const card of stepCards) {
    const titleMatch = card.match(/<h2>(.*?)<\/h2>/);
    const subtitleMatch = card.match(/<p class="step-subtitle">(.*?)<\/p>/);
    const title = titleMatch ? stripHtml(titleMatch[1]) : '';
    const subtitle = subtitleMatch ? stripHtml(subtitleMatch[1]) : '';

    // Extract detail items
    const details: string[] = [];
    const detailItems = card.match(/<div class="detail-text">([\s\S]*?)<\/div>/g);
    if (detailItems) {
      for (const item of detailItems) {
        const text = stripHtml(item);
        if (text.length > 5) {
          details.push(text);
        }
      }
    }

    // Extract handoff boxes
    const handoffs = card.match(/<div class="handoff-box">([\s\S]*?)<\/div>\s*<\/div>/g);
    if (handoffs) {
      for (const handoff of handoffs) {
        const text = stripHtml(handoff);
        if (text.length > 5) {
          details.push(`[Handoff] ${text}`);
        }
      }
    }

    if (title) {
      steps.push({ title, subtitle, details });
    }
  }

  return steps;
}

/**
 * Extract decision points from flowchart HTML.
 *
 * @param html - Full HTML content
 * @returns Array of decision objects
 */
function extractDecisions(html: string): Array<{ question: string; branches: string[] }> {
  const decisions: Array<{ question: string; branches: string[] }> = [];

  const diamonds = html.match(/<div class="decision-diamond[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g);
  if (!diamonds) return decisions;

  for (const diamond of diamonds) {
    const questionMatch = diamond.match(/<h3[^>]*>(.*?)<\/h3>/);
    const question = questionMatch ? stripHtml(questionMatch[1]) : '';

    const branches: string[] = [];
    const branchItems = diamond.match(/<div class="branch[^"]*">([\s\S]*?)<\/div>/g);
    if (branchItems) {
      for (const branch of branchItems) {
        branches.push(stripHtml(branch));
      }
    }

    if (question) {
      decisions.push({ question, branches });
    }
  }

  return decisions;
}

// #endregion

// #region Main Export

/**
 * Extract structured knowledge from a flowchart HTML file.
 * Produces a clean markdown document suitable for RAG indexing.
 *
 * @param html - Raw HTML content of the flowchart
 * @param filename - Source filename
 * @returns Markdown representation of the process knowledge
 */
export function extractFlowchartKnowledge(html: string, filename: string): string {
  const metadata = extractMetadata(html);
  const steps = extractSteps(html);
  const decisions = extractDecisions(html);

  // Extract page title
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const pageTitle = titleMatch ? stripHtml(titleMatch[1]) : filename;

  // Build markdown
  const lines: string[] = [];

  lines.push(`# ${metadata.process_name || pageTitle}`);
  lines.push('');

  // Metadata section
  if (Object.keys(metadata).length > 0) {
    lines.push('## מידע על התהליך');
    if (metadata.category) lines.push(`- **תחום:** ${metadata.category}`);
    if (metadata.trigger) lines.push(`- **טריגר:** ${metadata.trigger}`);
    if (metadata.real_case) lines.push(`- **מקרה אמיתי:** ${metadata.real_case}`);
    if (metadata.version) lines.push(`- **גרסה:** ${metadata.version}`);
    if (metadata.inputs) lines.push(`- **קלטים:** ${metadata.inputs}`);
    if (metadata.outputs) lines.push(`- **פלטים:** ${metadata.outputs}`);
    if (metadata.agents) lines.push(`- **סוכנים:** ${metadata.agents}`);
    if (metadata.states) lines.push(`- **מצבים:** ${metadata.states}`);
    lines.push('');
  }

  // Steps
  if (steps.length > 0) {
    lines.push('## שלבי התהליך');
    lines.push('');

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      lines.push(`### שלב ${i + 1}: ${step.title}`);
      if (step.subtitle) lines.push(step.subtitle);
      lines.push('');

      for (const detail of step.details) {
        lines.push(`- ${detail}`);
      }
      lines.push('');
    }
  }

  // Decision points
  if (decisions.length > 0) {
    lines.push('## נקודות החלטה');
    lines.push('');

    for (const decision of decisions) {
      lines.push(`### ${decision.question}`);
      for (const branch of decision.branches) {
        lines.push(`- ${branch}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// #endregion
