/* ============================================
   FILE: finalizationPipeline.ts
   PURPOSE: Generic document finalization pipeline.
            Source of Truth → QA → DOCX → result.
            Each document type provides its own FinalizationConfig.
   DEPENDENCIES: ./wordExportService, ../data/caseTypes
   EXPORTS: FinalizationConfig, QACheck, PreflightResult,
            runGenericQA, executeFinalization
   ============================================ */

import { exportToWord } from './wordExportService';
import type { WordSection, WordTableData } from './wordExportService';
import type { CaseEntity } from '../data/caseTypes';

// #region Types

/** Single QA check result */
export interface QACheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

/** Full preflight result */
export interface PreflightResult {
  passed: boolean;
  checks: QACheck[];
  blockers: QACheck[];
  /** Process type that was checked */
  processType: string;
}

/** Signature configuration for a document */
export interface SignatureConfig {
  name: string;
  role: string;
}

/** Credit line configuration */
export interface CreditConfig {
  text: string;
}

/**
 * Configuration for a specific document type.
 * Each process type (appeal, opinion, letter, report)
 * provides its own config to the pipeline.
 */
export interface FinalizationConfig {
  /** Process type identifier */
  processType: string;
  /** Display name for logs/UI */
  displayName: string;

  /** Phrases that should NEVER appear in this document type */
  blacklist: string[];

  /**
   * QA checks specific to this process type.
   * Returns checks; the pipeline adds generic checks on top.
   * @param body - The draft body text
   * @param entity - The full case entity
   */
  buildQAChecks: (body: string, entity: CaseEntity) => QACheck[];

  /**
   * Parse the draft body into WordSection[] for DOCX generation.
   * @param body - The draft body text
   * @param entity - The full case entity
   */
  parseBody: (body: string, entity: CaseEntity) => WordSection[];

  /**
   * Build the export metadata (title, subtitle, filename).
   * @param entity - The full case entity
   */
  buildExportMeta: (entity: CaseEntity) => {
    title: string;
    subtitle?: string;
    filename: string;
  };

  /** Whether to show branded header (default: true) */
  showHeader?: boolean;
  /** Whether to show branded footer (default: true) */
  showFooter?: boolean;
}

// #endregion

// #region Generic QA Checks

/**
 * Generic QA checks applied to ALL document types.
 * These are layered on top of process-specific checks.
 */
function buildGenericQAChecks(body: string, blacklist: string[]): QACheck[] {
  const checks: QACheck[] = [];

  // G1: No raw placeholders
  const hasPlaceholder = body.includes('${') || body.includes('[...]')
    || body.includes('TODO') || body.includes('FIXME') || body.includes('PLACEHOLDER');
  checks.push({
    id: 'G1', label: 'אין placeholder',
    passed: !hasPlaceholder,
    detail: hasPlaceholder ? 'נמצא placeholder בטקסט' : 'תקין',
  });

  // G2: Has Hebrew content (RTL)
  const hasHebrew = /[\u0590-\u05FF]/.test(body);
  checks.push({
    id: 'G2', label: 'RTL (עברית)',
    passed: hasHebrew,
    detail: hasHebrew ? 'תקין' : 'אין תוכן עברי',
  });

  // G3: Blacklist check
  const foundBlacklisted = blacklist.filter(p => body.includes(p));
  checks.push({
    id: 'G3', label: 'רשימה שחורה',
    passed: foundBlacklisted.length === 0,
    detail: foundBlacklisted.length ? `נמצאו: ${foundBlacklisted.join(', ')}` : 'תקין',
  });

  // G4: Body not empty
  const hasContent = body.trim().length > 100;
  checks.push({
    id: 'G4', label: 'תוכן מינימלי',
    passed: hasContent,
    detail: hasContent ? `${body.length} תווים` : 'גוף המסמך ריק או קצר מדי',
  });

  return checks;
}

// #endregion

// #region Pipeline Execution

/**
 * Run full QA (generic + process-specific) and return result.
 * Does NOT export — only checks.
 * @param config - Process-specific configuration
 * @param entity - The case entity to check
 */
export function runGenericQA(config: FinalizationConfig, entity: CaseEntity): PreflightResult {
  const body = entity.draft?.body || '';

  // Layer 1: Generic checks
  const genericChecks = buildGenericQAChecks(body, config.blacklist);

  // Layer 2: Process-specific checks
  const specificChecks = config.buildQAChecks(body, entity);

  const allChecks = [...genericChecks, ...specificChecks];
  const blockers = allChecks.filter(c => !c.passed);

  return {
    passed: blockers.length === 0,
    checks: allChecks,
    blockers,
    processType: config.processType,
  };
}

/**
 * Execute the full finalization pipeline:
 * 1. QA gate (generic + process-specific)
 * 2. Parse body → WordSection[]
 * 3. Export DOCX via wordExportService
 *
 * @param config - Process-specific configuration
 * @param entity - The case entity to finalize
 * @returns PreflightResult — caller checks .passed to know if DOCX was generated
 */
export async function executeFinalization(
  config: FinalizationConfig,
  entity: CaseEntity,
): Promise<PreflightResult> {
  // Step 1: QA gate
  const qa = runGenericQA(config, entity);

  if (!qa.passed) {
    console.error(
      `[Pipeline:${config.processType}] QA FAILED:`,
      qa.blockers.map(b => `${b.id}: ${b.detail}`).join(', '),
    );
    return qa;
  }

  // Step 2: Parse body into WordSections
  const body = entity.draft!.body!;
  const wordSections = config.parseBody(body, entity);

  // Step 3: Build export metadata
  const meta = config.buildExportMeta(entity);

  // Step 4: Export DOCX
  await exportToWord({
    title: meta.title,
    subtitle: meta.subtitle,
    filename: meta.filename,
    sections: wordSections,
    showHeader: config.showHeader !== false,
    showFooter: config.showFooter !== false,
  });

  console.log(`[Pipeline:${config.processType}] DOCX exported successfully`);
  return qa;
}

// #endregion

// #region Utility Exports

/** Re-export WordSection types for config builders */
export type { WordSection, WordTableData };

// #endregion
