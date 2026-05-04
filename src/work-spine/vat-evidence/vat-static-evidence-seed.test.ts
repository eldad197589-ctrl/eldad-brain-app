import { describe, expect, it } from 'vitest';

import { STATIC_VAT_EVIDENCE_RECORDS } from './vat-static-evidence-seed';
import {
  VAT_STATIC_EVIDENCE_MISSING,
  VAT_STATIC_EVIDENCE_SOURCE_ARTIFACT,
} from './vat-static-evidence-types';

describe('STATIC_VAT_EVIDENCE_RECORDS', () => {
  it('contains exactly the first eight static journal evidence records', () => {
    expect(STATIC_VAT_EVIDENCE_RECORDS).toHaveLength(8);
  });

  it('keeps source artifact and required field evidence on every record', () => {
    for (const record of STATIC_VAT_EVIDENCE_RECORDS) {
      expect(record.sourceArtifact).toBe(VAT_STATIC_EVIDENCE_SOURCE_ARTIFACT);
      expect(record.evidenceId).toBeTruthy();
      expect(record.clientOrMatter).toBeTruthy();
      expect(record.supplier).toBeTruthy();
      expect(record.invoiceDate).toBeTruthy();
      expect(record.periodDescription).toBeTruthy();
      expect(record.reportMonth).toMatch(/^(01|02)\/2026$/);
      expect(record.amountFieldAsInSource).toBeTruthy();
      expect(record.vatAmount).toBeTruthy();
      expect(record.vatReportAssignment).toContain(`חודש דיווח ${record.reportMonth}`);
      expect(record.expenseClassification).toContain('דורש בדיקת אלדד');
    }
  });

  it('uses amountFieldAsInSource and never exposes amountBeforeVat', () => {
    for (const record of STATIC_VAT_EVIDENCE_RECORDS) {
      expect(record.amountFieldAsInSource).toEqual(expect.any(String));
      expect('amountBeforeVat' in (record as Record<string, unknown>)).toBe(false);
    }
  });

  it('marks the extracted journal rows as recorded in the accounting system', () => {
    expect(
      STATIC_VAT_EVIDENCE_RECORDS.every(
        (record) => record.accountingSystemStatus === 'recorded_in_accounting_system',
      ),
    ).toBe(true);
  });

  it('keeps total values missing until an explicit total field is verified', () => {
    expect(
      STATIC_VAT_EVIDENCE_RECORDS.every(
        (record) => record.totalIfKnown === VAT_STATIC_EVIDENCE_MISSING,
      ),
    ).toBe(true);
  });

  it('does not include unrelated unreconciled values in this first seed', () => {
    const serializedRecords = JSON.stringify(STATIC_VAT_EVIDENCE_RECORDS);

    expect(serializedRecords).not.toContain('700.44');
    expect(serializedRecords).not.toContain('181');
    expect(serializedRecords).not.toContain('887');
    expect(serializedRecords).not.toContain('1,068');
  });
});
