/* ============================================
   FILE: UniversalRoutingSuggestionSection.tsx
   PURPOSE: Static local-only display for Universal Routing suggestions.
   DEPENDENCIES: React types, universal routing static seed
   EXPORTS: UniversalRoutingSuggestionSection (default)
   ============================================ */

// #region Imports
import type { CSSProperties } from 'react';
import { ALL_SEED_SUGGESTIONS } from '../../work-spine/routing/universal-routing-static-seed';
import type { RoutingDetectedEntity, RoutingDetectedKeyword, UniversalRoutingSuggestion } from '../../work-spine/routing/universal-routing-types';
// #endregion

// #region Styles
const sectionStyle: CSSProperties = {
  background: 'rgba(15, 23, 42, 0.84)',
  border: '1px solid rgba(45, 212, 191, 0.22)',
  borderRadius: 18,
  padding: 18,
  display: 'grid',
  gap: 16,
};

const cardStyle: CSSProperties = {
  borderRadius: 16,
  border: '1px solid rgba(148, 163, 184, 0.16)',
  background: 'rgba(30, 41, 59, 0.58)',
  padding: 14,
  display: 'grid',
  gap: 10,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 10,
};

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  width: 'fit-content',
  borderRadius: 999,
  padding: '5px 9px',
  color: '#ccfbf1',
  background: 'rgba(20, 184, 166, 0.14)',
  border: '1px solid rgba(20, 184, 166, 0.3)',
  fontSize: '0.78rem',
  fontWeight: 700,
};

const blockedBadgeStyle: CSSProperties = {
  ...badgeStyle,
  color: '#fde68a',
  background: 'rgba(245, 158, 11, 0.12)',
  border: '1px solid rgba(245, 158, 11, 0.3)',
};

const labelStyle: CSSProperties = {
  color: '#94a3b8',
  fontSize: '0.78rem',
};
// #endregion

// #region Helpers
const formatConfidence = (suggestion: UniversalRoutingSuggestion): string =>
  `${Math.round(suggestion.confidenceScore.score * 100)}% | high=${String(suggestion.confidenceScore.isHighConfidence)}`;

const formatEntities = (entities: readonly RoutingDetectedEntity[]): string =>
  entities.length > 0
    ? entities.map((entity) => `${entity.name} (${entity.confidence})`).join(', ')
    : 'none detected';

const formatKeywords = (keywords: readonly RoutingDetectedKeyword[]): string =>
  keywords.length > 0
    ? keywords.map((keyword) => `${keyword.keyword} | domain=${keyword.domain}`).join(', ')
    : 'none detected';

const formatKindSpecificDetail = (suggestion: UniversalRoutingSuggestion): string => {
  if (suggestion.kind === 'task') return `suggestedAction=${suggestion.suggestedAction}`;
  if (suggestion.kind === 'process') return `processDomain=${suggestion.processDomain}`;
  if (suggestion.kind === 'case_evidence') return `targetCaseId=${suggestion.targetCaseId}`;
  if (suggestion.kind === 'learning') return `learningDomain=${suggestion.learningDomain}`;
  return 'no operational target';
};
// #endregion

// #region Component
/** UniversalRoutingSuggestionSection — Displays static local-only routing suggestions without promotion. */
export default function UniversalRoutingSuggestionSection() {
  return (
    <section data-testid="universal-routing-suggestion-section" style={sectionStyle}>
      <div>
        <span style={badgeStyle}>static local preview</span>
        <h2 style={{ margin: '10px 0 0', color: '#f8fafc' }}>Universal Routing Suggestions — local only</h2>
        <p data-testid="universal-routing-safety-notice" style={{ margin: '8px 0 0', color: '#fde68a', lineHeight: 1.7 }}>
          Static suggestions only. No routing, promotion, persistence, or operational creation.
        </p>
      </div>

      <div data-testid="universal-routing-suggestion-list" style={{ display: 'grid', gap: 12 }}>
        {ALL_SEED_SUGGESTIONS.map((suggestion) => (
          <article
            key={`${suggestion.kind}-${suggestion.input.sourceChannel}-${suggestion.input.originalMetadata.timestamp}`}
            data-testid="universal-routing-suggestion-card"
            style={cardStyle}
          >
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div>
                <div style={labelStyle}>Suggested route kind</div>
                <h3 style={{ margin: '4px 0 0', color: '#f8fafc' }}>{suggestion.kind}</h3>
              </div>
              <span style={blockedBadgeStyle}>{suggestion.boundary.allowedMode}</span>
            </div>

            <div style={gridStyle}>
              <div>
                <div style={labelStyle}>Candidate source</div>
                <strong style={{ color: '#e2e8f0' }}>{suggestion.input.sourceChannel}</strong>
              </div>
              <div>
                <div style={labelStyle}>Confidence</div>
                <strong style={{ color: '#bbf7d0' }}>{formatConfidence(suggestion)}</strong>
              </div>
              <div>
                <div style={labelStyle}>Sender / source identity</div>
                <strong style={{ color: '#e2e8f0' }}>{suggestion.input.originalMetadata.senderIdentity}</strong>
              </div>
              <div>
                <div style={labelStyle}>Kind-specific preview</div>
                <strong style={{ color: '#bfdbfe' }}>{formatKindSpecificDetail(suggestion)}</strong>
              </div>
            </div>

            <div>
              <div style={labelStyle}>Suggested reason</div>
              <div style={{ color: '#f8fafc', lineHeight: 1.7 }}>{suggestion.suggestedReason}</div>
            </div>

            <div style={gridStyle}>
              <div>
                <div style={labelStyle}>Detected entities</div>
                <div style={{ color: '#e2e8f0', lineHeight: 1.7 }}>{formatEntities(suggestion.detectedEntities)}</div>
              </div>
              <div>
                <div style={labelStyle}>Detected keywords</div>
                <div style={{ color: '#e2e8f0', lineHeight: 1.7 }}>{formatKeywords(suggestion.detectedKeywords)}</div>
              </div>
            </div>

            <div data-testid="universal-routing-boundary" style={{ color: '#fde68a', lineHeight: 1.7 }}>
              <div>canCreateWorkItem={String(suggestion.boundary.canCreateWorkItem)}</div>
              <div>canCreateMatter={String(suggestion.boundary.canCreateMatter)}</div>
              <div>canCreateDocumentRef={String(suggestion.boundary.canCreateDocumentRef)}</div>
              <div>requiresEldadApproval={String(suggestion.boundary.requiresEldadApproval)}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
// #endregion
