/* ============================================
   FILE: constants.ts
   PURPOSE: Document categories, template helpers, and common field re-exports
   DEPENDENCIES: lucide-react, ./types, ./commonFields, ./letterTemplates
   EXPORTS: FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID, FIELD_SENDER, CATEGORIES, TEMPLATES, getTemplatesByCategory, searchTemplates
   ============================================ */
import {
  Landmark, Shield, Building2, Users, FileText,
} from 'lucide-react';
import type { LetterCategory, LetterTemplate } from './types';
import { TEMPLATES } from './letterTemplates';

// #region Re-exports (backward compatibility)

export { FIELD_DATE, FIELD_CLIENT_NAME, FIELD_CLIENT_ID, FIELD_SENDER } from './commonFields';
export { TEMPLATES } from './letterTemplates';

// #endregion

// #region Categories

/** Document categories displayed on the main page */
export const CATEGORIES: LetterCategory[] = [
  { id: 'tax_authorities', label: 'רשויות המס', icon: Landmark, color: '#818cf8' },
  { id: 'national_insurance', label: 'ביטוח לאומי', icon: Shield, color: '#60a5fa' },
  { id: 'banking', label: 'בנקים ופיננסים', icon: Building2, color: '#34d399' },
  { id: 'employment', label: 'דיני עבודה', icon: Users, color: '#2dd4bf' },
  { id: 'general', label: 'מכתבים כלליים', icon: FileText, color: '#94a3b8' },
];

// #endregion

// #region Helpers

/**
 * Get all templates for a specific category.
 *
 * @param categoryId — The category to filter by
 * @returns Filtered array of templates
 */
export function getTemplatesByCategory(categoryId: string): LetterTemplate[] {
  return TEMPLATES.filter(t => t.category === categoryId);
}

/**
 * Search templates by query across title, description, and tags.
 *
 * @param query — Search string
 * @returns Filtered array of templates matching the query
 */
export function searchTemplates(query: string): LetterTemplate[] {
  const q = query.toLowerCase();
  return TEMPLATES.filter(t =>
    t.title.toLowerCase().includes(q) ||
    t.description.toLowerCase().includes(q) ||
    t.tags?.some(tag => tag.includes(q))
  );
}

// #endregion
