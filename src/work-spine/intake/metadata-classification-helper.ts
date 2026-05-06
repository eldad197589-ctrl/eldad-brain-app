/* ==== FILE: src/work-spine/intake/metadata-classification-helper.ts ==== */

// #region Constants
/** Metadata-only category labels for scanned intake preview classification. */
export const METADATA_POSSIBLE_CATEGORIES = [
  'scan_metadata',
  'vat_metadata',
  'payroll_metadata',
  'case_context_metadata',
  'unknown_metadata',
] as const;

/** Confidence labels allowed for metadata-only preview classification. */
export const METADATA_CLASSIFICATION_CONFIDENCE = ['low', 'medium'] as const;

/** Static safety flags attached to every metadata-only classification result. */
export const METADATA_CLASSIFICATION_PREVIEW_FLAGS = {
  previewOnly: true,
  noLiveExecution: true,
  staticClassificationOnly: true,
  noSourceVerification: true,
} as const;
// #endregion

// #region Types
/** Possible category returned by metadata-only classification. */
export type MetadataPossibleCategory = (typeof METADATA_POSSIBLE_CATEGORIES)[number];

/** Confidence level returned by metadata-only classification. */
export type MetadataClassificationConfidence = (typeof METADATA_CLASSIFICATION_CONFIDENCE)[number];

interface MetadataCategoryRule {
  possibleCategory: MetadataPossibleCategory;
  terms: readonly string[];
  reason: string;
}

/** Input metadata fields allowed for static scanned-intake classification preview. */
export interface MetadataClassificationInput {
  /** File name from the static snapshot metadata. */
  fileName: string;
  /** Extension from the static snapshot metadata, with or without leading dot. */
  extension?: string;
  /** Folder label from the static snapshot metadata. */
  folderLabel?: string;
  /** Relative path label from the static snapshot metadata. */
  relativePathLabel?: string;
  /** Snapshot group labels from the static scanned intake snapshot. */
  snapshotGroupLabels?: readonly string[];
}

/** Defensive metadata-only classification preview result. */
export interface MetadataClassificationResult {
  /** Possible category inferred from metadata labels only. */
  possibleCategory: MetadataPossibleCategory;
  /** Low or medium confidence only; metadata never produces high confidence. */
  confidence: MetadataClassificationConfidence;
  /** Defensive reason explaining that only metadata signals were used. */
  reason: string;
  /** Safe signal labels that contributed to the preview classification. */
  sourceSignals: readonly string[];
  /** Every result requires Eldad review before any later use. */
  needsEldadReview: true;
  /** Preview-only flag. */
  previewOnly: true;
  /** No live execution flag. */
  noLiveExecution: true;
  /** Static classification only flag. */
  staticClassificationOnly: true;
  /** No source verification flag. */
  noSourceVerification: true;
}
// #endregion

// #region Rules
const CATEGORY_RULES: readonly MetadataCategoryRule[] = [
  {
    possibleCategory: 'vat_metadata',
    terms: ['vat', 'מע״מ', 'מעמ', 'maven', 'מייבן', 'invoice', 'חשבונית'],
    reason: 'Possible VAT metadata signal from names and labels only; Eldad review is required.',
  },
  {
    possibleCategory: 'payroll_metadata',
    terms: ['payroll', 'salary', 'שכר', 'תלוש', 'attendance', 'נוכחות'],
    reason: 'Possible payroll metadata signal from names and labels only; Eldad review is required.',
  },
  {
    possibleCategory: 'case_context_metadata',
    terms: ['דימה', 'צילה', 'dima', 'tsila', 'case', 'תיק'],
    reason: 'Possible case-context metadata signal from names and labels only; Eldad review is required.',
  },
  {
    possibleCategory: 'scan_metadata',
    terms: ['scan', 'סריק', 'pdf', 'jpg', 'jpeg', 'png', 'tif', 'tiff'],
    reason: 'Possible scan metadata signal from names and labels only; Eldad review is required.',
  },
];
// #endregion

// #region Helpers
const normalize = (value: string | undefined): string => (value ?? '').trim().toLowerCase();

const extensionFromFileName = (fileName: string): string => {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex >= 0 ? fileName.slice(lastDotIndex + 1) : '';
};

const normalizedExtension = (input: MetadataClassificationInput): string =>
  normalize(input.extension ?? extensionFromFileName(input.fileName)).replace(/^\./, '');

const metadataText = (input: MetadataClassificationInput): string =>
  [
    input.fileName,
    input.folderLabel,
    input.relativePathLabel,
    normalizedExtension(input),
    ...(input.snapshotGroupLabels ?? []),
  ]
    .map(normalize)
    .filter(Boolean)
    .join(' ');

const matchedTerms = (text: string, terms: readonly string[]): readonly string[] =>
  terms.filter((term) => text.includes(normalize(term)));

const signalLabels = (input: MetadataClassificationInput, terms: readonly string[]): readonly string[] => {
  const extension = normalizedExtension(input);
  const fields = [
    ['fileName', input.fileName],
    ['folderLabel', input.folderLabel],
    ['relativePathLabel', input.relativePathLabel],
    ['snapshotGroupLabel', (input.snapshotGroupLabels ?? []).join(' ')],
  ] as const;
  const labels = fields.flatMap(([fieldName, value]) =>
    matchedTerms(normalize(value), terms).map((term) => `${fieldName}:${term}`),
  );

  return extension ? [...labels, `extension:${extension}`] : labels;
};

const emptyResult = (sourceSignals: readonly string[]): MetadataClassificationResult => ({
  possibleCategory: 'unknown_metadata',
  confidence: 'low',
  reason: 'Only metadata labels were available; Eldad review is required before any later use.',
  sourceSignals,
  needsEldadReview: true,
  ...METADATA_CLASSIFICATION_PREVIEW_FLAGS,
});
// #endregion

// #region Public API
/** Classifies scanned intake candidates using static metadata labels only. */
export function classifyScannedIntakeMetadata(
  input: MetadataClassificationInput,
): MetadataClassificationResult {
  const text = metadataText(input);
  const rankedRules = CATEGORY_RULES.map((rule) => ({
    rule,
    score: matchedTerms(text, rule.terms).length,
  })).sort((firstRule, secondRule) => secondRule.score - firstRule.score);
  const bestMatch = rankedRules[0];

  if (!bestMatch || bestMatch.score === 0) {
    return emptyResult(signalLabels(input, []));
  }

  return {
    possibleCategory: bestMatch.rule.possibleCategory,
    confidence: bestMatch.score >= 2 ? 'medium' : 'low',
    reason: bestMatch.rule.reason,
    sourceSignals: signalLabels(input, bestMatch.rule.terms),
    needsEldadReview: true,
    ...METADATA_CLASSIFICATION_PREVIEW_FLAGS,
  };
}
// #endregion
