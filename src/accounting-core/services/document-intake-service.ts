// ==========================================
// FILE: document-intake-service.ts
// PURPOSE: Backend/domain service to convert SyncedFileRecords into DocumentIntakeEntities.
// DEPENDENCIES: accounting-core-types.ts
// ==========================================

import {
  SyncedFileRecord,
  DocumentIntakeEntity,
  SyncStatus,
  IntakeStatus,
  DocumentTypeHint
} from '../types/accounting-core-types';

export interface DocumentIntakeResult {
  accepted_intakes: DocumentIntakeEntity[];
  rejected_records: SyncedFileRecord[]; // Records that failed intake validation
}

/**
 * Universal UUID generator fallback for domain ID creation.
 */
function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `uuid-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Coarse document type hinting logic based on source contexts.
 * Domain abstraction: Translates filename semantics strictly to Enum without deep OCR pixel parsing.
 */
function deriveCoarseDocumentTypeHint(sourcePath: string): DocumentTypeHint {
  const normalizedPath = sourcePath.toLowerCase();
  
  if (normalizedPath.includes('invoice') || normalizedPath.includes('חשבונית')) {
    return DocumentTypeHint.INVOICE;
  }
  if (normalizedPath.includes('receipt') || normalizedPath.includes('קבלה')) {
    return DocumentTypeHint.RECEIPT;
  }
  if (normalizedPath.includes('statement') || normalizedPath.includes('בנק') || normalizedPath.includes('פירוט')) {
    return DocumentTypeHint.STATEMENT;
  }
  if (normalizedPath.includes('mixed')) {
    return DocumentTypeHint.MIXED;
  }
  
  return DocumentTypeHint.UNKNOWN;
}

/**
 * CORE SERVICE 2: Document Intake Service
 * Responsibility: Translate synced physical file references strictly into formal system intake entities,
 * preparing them exclusively for the downstream optical extraction engines with immutable trace linkage.
 */
export class DocumentIntakeService {

  /**
   * Processes pre-synchronized file records, enforcing ingestion boundaries and translating 
   * acceptable formats strictly into tracking trace-linked entities.
   */
  public processSyncedFiles(syncedRecords: SyncedFileRecord[]): DocumentIntakeResult {
    const accepted_intakes: DocumentIntakeEntity[] = [];
    const rejected_records: SyncedFileRecord[] = [];

    for (const record of syncedRecords) {
      // 1. Accept only files with usable sync status
      // Any record not perfectly 'SYNCED' (e.g., DUPLICATE_SUSPECT, UNREADABLE) is rejected early.
      if (record.sync_status !== SyncStatus.SYNCED) {
        rejected_records.push(record);
        continue;
      }

      // 2. Perform coarse file-type/document-type hinting without opening actual content pixels
      const docTypeHint = deriveCoarseDocumentTypeHint(record.source_path);

      // 3. Status boundary check
      let initialIntakeStatus = IntakeStatus.RECEIVED;
      let reviewReason: string | undefined;

      // Reject ambiguous / unusable records into NEEDS_REVIEW if completely opaque context
      if (docTypeHint === DocumentTypeHint.UNKNOWN) {
        initialIntakeStatus = IntakeStatus.NEEDS_REVIEW;
        reviewReason = 'Unclear document type context from source trace; requires manual optical triage.';
      } else {
        // Document type is coarsely identifiable safely; status advances.
        initialIntakeStatus = IntakeStatus.DOCUMENT_IDENTIFIED;
        
        // In a true downstream pass confirming file connectivity, this elevates to SOURCE_LINKED.
        // For the ingestion transformation border, IDENTIFIED asserts validity. 
      }

      // 4. Create DocumentIntakeEntity outputs only 
      // Source Path trace, ID bindings, and confidence parameters explicitly preserved
      const intakeEntity: DocumentIntakeEntity = {
        id: generateUuid(),
        synced_file_record_id: record.id, // Strictly preserve source file linkage
        detected_document_type: docTypeHint,
        // Confidence remains relatively abstract/low initially until the Extraction Service runs over pixels
        document_identification_confidence: docTypeHint === DocumentTypeHint.UNKNOWN ? 0.0 : 0.65, 
        source_link_candidate: record.source_path, // Maintain client/period hints transparently here
        intake_status: initialIntakeStatus,
        review_reason_if_needed: reviewReason
      };

      accepted_intakes.push(intakeEntity);
    }

    return {
      accepted_intakes,
      rejected_records
    };
  }
}
