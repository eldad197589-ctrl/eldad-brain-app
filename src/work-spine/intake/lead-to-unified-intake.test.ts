/* ============================================
   FILE: lead-to-unified-intake.test.ts
   PURPOSE: Focused tests for the pure lead-to-unified intake mapper.
   DEPENDENCIES: vitest, lead-to-unified-intake
   EXPORTS: None
   ============================================ */

// #region Imports
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { LeadIntakeInput } from './lead-to-unified-intake';
import { createUnifiedIntakeFromLeads } from './lead-to-unified-intake';
// #endregion

// #region Test Data
const projectRoot = 'C:/Users/1/OneDrive/שולחן העבודה/אלדד/גרוויטי תקיות/המוח של אלדד/brain-app';

const createLead = (overrides: Partial<LeadIntakeInput> = {}): LeadIntakeInput => ({
  leadId: 'lead-1',
  leadSource: 'website_form',
  contactFields: {
    email: 'lead@example.test',
    phone: '050-0000000',
  },
  submittedAt: '2026-04-29T00:00:00.000Z',
  declaredInterest: 'ייעוץ מס',
  declaredClientName: 'ליד לדוגמה',
  declaredCompanyName: 'חברה לדוגמה',
  email: 'lead@example.test',
  phone: '050-0000000',
  messageText: 'מבקש לקבל פרטים על שירות.',
  sourceCampaign: 'spring-campaign',
  referrer: 'https://example.test/referrer',
  notes: 'פנייה ראשונית',
  ...overrides,
});
// #endregion

// #region Tests
describe('createUnifiedIntakeFromLeads', () => {
  it('maps lead to unified candidate', () => {
    const result = createUnifiedIntakeFromLeads([createLead()]);

    expect(result.candidates).toHaveLength(1);
    expect(result.candidates[0]).toMatchObject({
      sourceType: 'lead',
      sourceId: 'lead-1',
      sourceLabel: 'ייעוץ מס',
      candidateStatus: 'staging_candidate',
      professionalStatus: 'not_reviewed',
      matterResolutionStatus: 'unresolved',
      subjectResolutionStatus: 'unresolved',
    });
    expect(result.candidates[0]?.sourceMetadata).toEqual({
      sourceType: 'lead',
      leadId: 'lead-1',
      leadSource: 'website_form',
      contactFields: {
        email: 'lead@example.test',
        phone: '050-0000000',
      },
      submittedAt: '2026-04-29T00:00:00.000Z',
      declaredInterest: 'ייעוץ מס',
    });
  });

  it('maps lead form or message to lead_form evidence', () => {
    const result = createUnifiedIntakeFromLeads([createLead()]);

    expect(result.evidenceRefs).toHaveLength(1);
    expect(result.evidenceRefs[0]).toMatchObject({
      sourceType: 'lead',
      evidenceKind: 'lead_form',
      title: 'ייעוץ מס',
      leadId: 'lead-1',
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
    expect(result.evidenceRefs[0]?.sourceCandidateId).toBe(result.candidates[0]?.candidateId);
  });

  it('keeps contact and interest fields as low-confidence unconfirmed hints', () => {
    const result = createUnifiedIntakeFromLeads([createLead()]);
    const candidate = result.candidates[0];

    expect(candidate?.suggestedContext).toEqual([
      { label: 'website_form', source: 'lead_source', confidence: 'low', isConfirmed: false },
      { label: 'lead@example.test', source: 'lead_contact_field:email', confidence: 'low', isConfirmed: false },
      { label: '050-0000000', source: 'lead_contact_field:phone', confidence: 'low', isConfirmed: false },
      { label: 'ייעוץ מס', source: 'lead_declared_interest', confidence: 'low', isConfirmed: false },
      { label: 'ליד לדוגמה', source: 'lead_declared_client_name', confidence: 'low', isConfirmed: false },
      { label: 'חברה לדוגמה', source: 'lead_declared_company_name', confidence: 'low', isConfirmed: false },
      { label: 'lead@example.test', source: 'lead_email', confidence: 'low', isConfirmed: false },
      { label: '050-0000000', source: 'lead_phone', confidence: 'low', isConfirmed: false },
      { label: 'מבקש לקבל פרטים על שירות.', source: 'lead_message_text', confidence: 'low', isConfirmed: false },
      { label: 'spring-campaign', source: 'lead_source_campaign', confidence: 'low', isConfirmed: false },
      { label: 'https://example.test/referrer', source: 'lead_referrer', confidence: 'low', isConfirmed: false },
      { label: 'פנייה ראשונית', source: 'lead_notes', confidence: 'low', isConfirmed: false },
    ]);
    expect((candidate as unknown as Record<string, unknown>).clientId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).subjectId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).matterId).toBeUndefined();
    expect((candidate as unknown as Record<string, unknown>).priority).toBeUndefined();
  });

  it('keeps statuses locked to not reviewed and unresolved', () => {
    const result = createUnifiedIntakeFromLeads([createLead()]);
    const candidate = result.candidates[0];

    expect(candidate?.professionalStatus).toBe('not_reviewed');
    expect(candidate?.matterResolutionStatus).toBe('unresolved');
    expect(candidate?.subjectResolutionStatus).toBe('unresolved');
  });

  it('keeps evidence unprocessed, unclassified, and not reviewed', () => {
    const result = createUnifiedIntakeFromLeads([createLead()]);

    expect(result.evidenceRefs[0]).toMatchObject({
      ocrStatus: 'not_processed',
      classificationStatus: 'not_classified',
      reviewStatus: 'not_reviewed',
    });
  });

  it('generates deterministic ids across repeated runs', () => {
    const input = [createLead()];
    const first = createUnifiedIntakeFromLeads(input);
    const second = createUnifiedIntakeFromLeads(input);

    expect(first.candidates.map((candidate) => candidate.candidateId)).toEqual(
      second.candidates.map((candidate) => candidate.candidateId)
    );
    expect(first.evidenceRefs.map((evidence) => evidence.evidenceId)).toEqual(
      second.evidenceRefs.map((evidence) => evidence.evidenceId)
    );
    expect(first.candidates[0]?.candidateId).toMatch(/^unified-lead-candidate-/);
    expect(first.evidenceRefs[0]?.evidenceId).toMatch(/^unified-lead-evidence-/);
  });

  it('does not mutate input', () => {
    const input = [createLead()];
    const before = JSON.stringify(input);

    createUnifiedIntakeFromLeads(input);

    expect(JSON.stringify(input)).toBe(before);
  });

  it('skips invalid lead and reports diagnostics', () => {
    const result = createUnifiedIntakeFromLeads([
      createLead({
        submittedAt: '',
        contactFields: {},
        declaredInterest: '',
        messageText: '',
      }),
      createLead({
        leadId: undefined,
        email: 'missing-id@example.test',
      }),
    ]);

    expect(result.diagnostics).toMatchObject({
      candidateCount: 1,
      evidenceCount: 1,
      leadCount: 2,
    });
    expect(result.diagnostics.warnings.map((warning) => warning.warningCode)).toEqual([
      'missing_submitted_at',
      'missing_contact_fields',
      'missing_declared_interest',
      'missing_message_text',
    ]);
    expect(result.diagnostics.skippedItems).toEqual([
      { sourceId: 'missing-id@example.test', reason: 'missing_lead_id' },
    ]);
    expect(result.diagnostics.errors).toEqual([
      {
        sourceId: 'missing-id@example.test',
        message: 'Lead metadata is missing leadId.',
      },
    ]);
  });

  it('keeps source free of external lead connectors, stores, persistence, and professional creation helpers', () => {
    const source = readFileSync(`${projectRoot}/src/work-spine/intake/lead-to-unified-intake.ts`, 'utf8');

    expect(source).not.toMatch(/crm/i);
    expect(source).not.toMatch(/(^|[^a-z])api([^a-z]|$)/i);
    expect(source).not.toContain('fetch(');
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('indexedDB');
    expect(source).not.toContain('supabase');
    expect(source).not.toContain('zustand');
    expect(source).not.toContain('useBrainStore');
    expect(source).not.toContain('useMatterStore');
    expect(source).not.toContain('createWorkItem');
    expect(source).not.toContain('createMatter');
    expect(source).not.toContain('createDocumentRef');
    expect(source).not.toContain('createIntakeEvent');
    expect(source).not.toContain('createIntakeAttachment');
    expect(source).not.toContain('createClient');
    expect(source).not.toContain('createSubject');
  });
});
// #endregion
