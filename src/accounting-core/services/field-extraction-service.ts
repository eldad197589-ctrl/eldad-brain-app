// ==========================================
// FILE: field-extraction-service.ts
// PURPOSE: Backend/domain service substituting for OCR/Optical extraction structuring boundaries.
// DEPENDENCIES: accounting-core-types.ts
// ==========================================

import {
  DocumentIntakeEntity,
  ExtractedFieldSet,
  IntakeStatus,
  ExtractionStatus,
  DocumentTypeHint
} from '../types/accounting-core-types';

/**
 * Abstraction payload simulating external OCR/AI Vision ingestion engine outputs
 * bound strictly to the allowed canonical properties.
 */
export interface RawOcrSimulatedInput {
  document_number_if_exists?: string;
  issue_date?: string;
  supplier_name_if_exists?: string;
  supplier_id_if_exists?: string;
  customer_name_if_exists?: string;
  customer_id_if_exists?: string;
  gross_amount_if_exists?: number;
  vat_amount_if_exists?: number;
  net_amount_if_exists?: number;
  currency?: string;
  period_hint_if_exists?: string;
}

export interface FieldExtractionResult {
  extracted_fields: ExtractedFieldSet[];
  rejected_intakes: DocumentIntakeEntity[]; // Items disqualified from processing
}

/**
 * Universal UUID generator fallback.
 */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Validates fundamental financial arithmetic identity (Gross = Net + VAT)
 * Avoiding generalized JS float jitter through basic tolerance checks.
 */
function isArithmeticConsistent(gross?: number, net?: number, vat?: number): boolean {
  if (gross === undefined || net === undefined || vat === undefined) {
    return true; // We cannot assert contradiction if variables are missing
  }
  
  const calculatedGross = net + vat;
  const difference = Math.abs(gross - calculatedGross);
  
  // Standard arithmetic rounding tolerance in localized invoices (usually ~0.01)
  return difference <= 0.02;
}

/**
 * CORE SERVICE 3: Field Extraction Service
 * Responsibility: Translate valid Intake Entities into strictly structured data schemas.
 * Represents purely OCR / Vision interpretation bounds without assigning systemic truth nor classification.
 */
export class FieldExtractionService {

  /**
   * Processes qualified intake entities utilizing simulated/provided raw OCR payloads, 
   * performing mathematical integrity checks prior to assigning extraction statuses.
   */
  public extractFields(
    intakes: DocumentIntakeEntity[], 
    rawPayloads: Map<string, RawOcrSimulatedInput> // Maps intake entity ID to its vision extraction output
  ): FieldExtractionResult {
    
    const extracted_fields: ExtractedFieldSet[] = [];
    const rejected_intakes: DocumentIntakeEntity[] = [];

    for (const intake of intakes) {
      // 1. Accept only usable intake statuses representing visually capable files
      if (
        intake.intake_status === IntakeStatus.BLOCKED || 
        intake.intake_status === IntakeStatus.RECEIVED // Requires some IDENTIFICATION beforehand
      ) {
        rejected_intakes.push(intake);
        continue;
      }

      const rawData = rawPayloads.get(intake.id);
      
      // Setup output entity protecting source trace 
      const fieldSet: ExtractedFieldSet = {
        id: generateUuid(),
        document_intake_id: intake.id, // Immutable trace connection to phase 2
        document_type: intake.detected_document_type,
        extraction_confidence: 0,
        extraction_status: ExtractionStatus.NOT_STARTED,
      };

      if (!rawData) {
        fieldSet.extraction_status = ExtractionStatus.UNREADABLE;
        fieldSet.unreadable_reason_if_any = "No OCR payload supplied or payload structurally deficient.";
        extracted_fields.push(fieldSet);
        continue;
      }

      // 2. Hydrate canonical fields exclusively
      fieldSet.document_number_if_exists = rawData.document_number_if_exists;
      fieldSet.issue_date = rawData.issue_date;
      fieldSet.supplier_name_if_exists = rawData.supplier_name_if_exists;
      fieldSet.supplier_id_if_exists = rawData.supplier_id_if_exists;
      fieldSet.customer_name_if_exists = rawData.customer_name_if_exists;
      fieldSet.customer_id_if_exists = rawData.customer_id_if_exists;
      fieldSet.gross_amount_if_exists = rawData.gross_amount_if_exists;
      fieldSet.vat_amount_if_exists = rawData.vat_amount_if_exists;
      fieldSet.net_amount_if_exists = rawData.net_amount_if_exists;
      fieldSet.currency = rawData.currency || "ILS";
      fieldSet.period_hint_if_exists = rawData.period_hint_if_exists;

      // 3. Evaluate Arithmetic Consistency & Missing Value Triage
      const contradictionFlags: string[] = [];
      let finalStatus: ExtractionStatus = ExtractionStatus.EXTRACTED;

      const hasGross = fieldSet.gross_amount_if_exists !== undefined;
      const hasNet = fieldSet.net_amount_if_exists !== undefined;
      const hasVat = fieldSet.vat_amount_if_exists !== undefined;
      const hasSupplierId = fieldSet.supplier_id_if_exists !== undefined;

      // Basic completeness downgrade
      if (!hasSupplierId || (!hasGross && !hasNet)) {
        finalStatus = ExtractionStatus.PARTIAL;
      }

      // Strict mathematical flag assessment
      if (hasGross && hasNet && hasVat) {
        if (!isArithmeticConsistent(fieldSet.gross_amount_if_exists, fieldSet.net_amount_if_exists, fieldSet.vat_amount_if_exists)) {
          contradictionFlags.push("ARITHMETIC_MISMATCH: gross != net + vat");
          finalStatus = ExtractionStatus.NEEDS_REVIEW; // Contradictions force a human optical review gate
        }
      }

      // Apply findings
      fieldSet.extraction_status = finalStatus;
      if (contradictionFlags.length > 0) {
        fieldSet.contradiction_flags_if_any = contradictionFlags;
        // Deteriorate confidence completely upon logical mathematical failure
        fieldSet.extraction_confidence = 0.1; 
      } else {
        fieldSet.extraction_confidence = finalStatus === ExtractionStatus.EXTRACTED ? 0.95 : 0.5;
      }

      extracted_fields.push(fieldSet);
    }

    return {
      extracted_fields,
      rejected_intakes
    };
  }
}
