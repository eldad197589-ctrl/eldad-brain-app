/* ============================================
   FILE: index.ts
   PURPOSE: Re-export for messaging feature folder
   DEPENDENCIES: ./types, ./constants
   EXPORTS: all types + constants
   ============================================ */

export type {
  MessageContact,
  MessageTemplate,
  MessageDraft,
  MessageLogEntry,
  MessageCategory,
  DraftStatus,
  DeliveryMethod,
  PersonalizationContext,
} from './types';

export {
  MESSAGE_CATEGORY_LABELS,
  BUILT_IN_TEMPLATES,
  PLACEHOLDER_LABELS,
} from './constants';
