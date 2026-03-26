/* ============================================
   FILE: commonFields.ts
   PURPOSE: Common reusable letter fields (date, client name, client ID, sender)
   DEPENDENCIES: ./types
   EXPORTS: FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID, FIELD_SENDER
   ============================================ */
import type { LetterField } from './types';

// #region Common Fields

/** Standard date field */
export const FIELD_DATE: LetterField = {
  id: 'date', label: 'תאריך', type: 'date', required: true,
  defaultValue: new Date().toISOString().split('T')[0],
};

/** Client name field */
export const FIELD_CLIENT_NAME: LetterField = {
  id: 'client_name', label: 'שם הלקוח / העסק', type: 'text', required: true,
};

/** Client ID (ת.ז / ח.פ) */
export const FIELD_CLIENT_ID: LetterField = {
  id: 'client_id', label: 'ת.ז / ח.פ', type: 'text', required: true,
};

/** Sender/signer name */
export const FIELD_SENDER: LetterField = {
  id: 'sender_name', label: 'שם החותם', type: 'text', defaultValue: 'אלדד דוד רו"ח',
};

// #endregion
