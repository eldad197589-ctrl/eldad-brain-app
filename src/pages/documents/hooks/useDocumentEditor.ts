/**
 * useDocumentEditor — Document editor state & logic
 *
 * FILE: hooks/useDocumentEditor.ts
 * PURPOSE: Manages form data, generates content by replacing {{placeholders}},
 *          and produces the final subject line for a selected template.
 * DEPENDENCIES: types.ts
 */
import { useState, useCallback, useMemo } from 'react';
import type { LetterTemplate } from '../types';

// #region Hook

/**
 * Manages the form state for a selected letter template.
 *
 * @param template — The currently selected letter template (or null)
 * @returns Form data state, handlers, and generated content
 */
export function useDocumentEditor(template: LetterTemplate | null) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [editedContent, setEditedContent] = useState('');

  /** Initialize form with template field defaults */
  const initForm = useCallback((tmpl: LetterTemplate) => {
    const initial: Record<string, string> = {};
    tmpl.fields.forEach(field => {
      initial[field.id] = field.defaultValue || '';
    });
    setFormData(initial);
    setEditedContent('');
  }, []);

  /** Update a single form field */
  const updateField = useCallback((fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  }, []);

  /** Replace all {{placeholder}} tokens in content with form values */
  const generateContent = useCallback((): string => {
    if (!template) return '';
    let content = template.content;
    Object.entries(formData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value || `[${key}]`);
    });
    return content;
  }, [template, formData]);

  /** Generate the subject line with placeholders replaced */
  const subject = useMemo(() => {
    if (!template) return '';
    return template.defaultSubject.replace(
      /\{\{([^}]+)\}\}/g,
      (_, key) => formData[key] || `[${key}]`
    );
  }, [template, formData]);

  /** Get the final content (user-edited or generated) */
  const finalContent = useMemo(() => {
    return editedContent || generateContent();
  }, [editedContent, generateContent]);

  /** Today's date formatted for display */
  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('he-IL');
  }, []);

  return {
    formData,
    editedContent,
    subject,
    finalContent,
    todayFormatted,
    initForm,
    updateField,
    setEditedContent,
    generateContent,
  };
}

// #endregion
