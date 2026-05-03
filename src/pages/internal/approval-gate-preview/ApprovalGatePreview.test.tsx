/* ============================================
   FILE: ApprovalGatePreview.test.tsx
   PURPOSE: Focused render tests for the Stage 7B read-only Approval Gate preview.
   DEPENDENCIES: Vitest, React server renderer, static ApprovalDecision fixtures
   EXPORTS: Test suite
   ============================================ */

// #region Imports
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { STATIC_APPROVAL_DECISIONS } from '../../../work-spine/approval/approval-decision-seed';
import ApprovalGatePreview from './ApprovalGatePreview';
// #endregion

// #region Constants
const REQUIRED_STATUSES = [
  'pending_review',
  'approved_for_candidate_preview',
  'rejected',
  'needs_more_evidence',
  'blocked',
] as const;

const REQUIRED_BLOCKED_EFFECTS = [
  'canCreateWorkItem=false',
  'canCreateMatter=false',
  'canCreateDocumentRef=false',
  'canPersist=false',
  'canRoute=false',
  'canExecuteProviderAction=false',
  'canCreateTask=false',
  'canCreateCalendarItem=false',
  'canCreateWorkflowItem=false',
] as const;
// #endregion

// #region Helpers
const renderPreview = (): string => renderToStaticMarkup(<ApprovalGatePreview />);
// #endregion

// #region Tests
describe('ApprovalGatePreview', () => {
  it('renders every static approval decision fixture', () => {
    const html = renderPreview();
    const renderedDecisions = html.match(/data-testid="approval-gate-preview-decision"/g) ?? [];

    expect(renderedDecisions).toHaveLength(STATIC_APPROVAL_DECISIONS.length);

    STATIC_APPROVAL_DECISIONS.forEach((decision) => {
      expect(html).toContain(decision.decisionId);
      expect(html).toContain(decision.sourceId);
      expect(html).toContain(decision.sourceType);
      expect(html).toContain(decision.status);
      expect(html).toContain(decision.reviewedBy);
      expect(html).toContain(decision.reviewedAt);
      expect(html).toContain(decision.decisionReason);
      expect(html).toContain(decision.allowedNextStep);
    });
  });

  it('shows metadata-preview-only approval scope for every fixture', () => {
    const html = renderPreview();
    const scopeMatches = html.match(/metadata_preview_only/g) ?? [];

    expect(scopeMatches).toHaveLength(STATIC_APPROVAL_DECISIONS.length);
  });

  it('shows every required approval status', () => {
    const html = renderPreview();

    REQUIRED_STATUSES.forEach((status) => {
      expect(html).toContain(status);
    });
  });

  it('shows all blocked operational effects as false', () => {
    const html = renderPreview();

    REQUIRED_BLOCKED_EFFECTS.forEach((effect) => {
      expect(html).toContain(effect);
    });
  });

  it('shows read-only stage warnings', () => {
    const html = renderPreview();

    expect(html).toContain('Read-only approval preview');
    expect(html).toContain('Static fixtures only');
    expect(html).toContain('No approval interaction in this stage');
    expect(html).toContain('No operational object can be created from this preview');
  });

  it('renders no buttons or operational handlers', () => {
    const html = renderPreview();

    expect(html).not.toContain('<button');
    expect(html).not.toContain('onClick');
    expect(html).not.toContain('Approve</button');
    expect(html).not.toContain('Reject</button');
    expect(html).not.toContain('Defer</button');
    expect(html).not.toContain('Block</button');
  });

  it('does not expose forbidden runtime integration markers', () => {
    const html = renderPreview();
    const forbiddenRuntimeMarkers = [
      'useBrainStore',
      'useMatterStore',
      'brainStore',
      'matterStore',
      'localStorage',
      'Supabase',
      'googleapis',
      'OAuth',
      'OCR',
    ] as const;

    forbiddenRuntimeMarkers.forEach((marker) => {
      expect(html).not.toContain(marker);
    });
  });
});
// #endregion
