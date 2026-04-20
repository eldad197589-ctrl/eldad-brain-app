/* ============================================
// #region Module

   FILE: types.ts
   PURPOSE: Interfaces and types for the Client Onboarding Wizard
   DEPENDENCIES: None
   EXPORTS: EntityType, DocumentItem, KycState
   ============================================ */

export type EntityType = 'exempt' | 'authorized' | 'partnership' | 'company' | 'npo' | 'employee' | 'pensioner';

export interface DocumentItem {
  id: string;
  category: 'permanent' | 'regulatory' | 'transfer' | 'employee';
  label: string;
  description?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  /** How the document is obtained: client uploads, system fills form, or CPA generates and sends */
  actionType?: 'upload' | 'fill_form' | 'generate_send';
  /** Whether this document is mandatory for onboarding completion */
  required?: boolean;
  /** Collection urgency — controls sort order in checklist */
  priority?: 'high' | 'medium' | 'low';
}

export interface KycState {
  clientName: string;
  entityType: EntityType;
  isTransfer: boolean;
  documents: DocumentItem[];
}
// #endregion
