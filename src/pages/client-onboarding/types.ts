/* ============================================
// #region Module

   FILE: types.ts
   PURPOSE: Interfaces and types for the Client Onboarding Wizard
   DEPENDENCIES: None
   EXPORTS: EntityType, DocumentItem, KycState
   ============================================ */

export type EntityType = 'exempt' | 'authorized' | 'partnership' | 'company' | 'npo';

export interface DocumentItem {
  id: string;
  category: 'permanent' | 'regulatory' | 'transfer';
  label: string;
  description?: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
}

export interface KycState {
  clientName: string;
  entityType: EntityType;
  isTransfer: boolean;
  documents: DocumentItem[];
}
// #endregion
