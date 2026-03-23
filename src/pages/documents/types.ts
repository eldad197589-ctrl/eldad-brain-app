/**
 * Documents — Domain-Specific Types
 *
 * FILE: types.ts
 * PURPOSE: Interfaces for the document filling system (letters, forms, agreements).
 * DEPENDENCIES: lucide-react (for icon type)
 */
import type { LucideIcon } from 'lucide-react';

// #region Field Types

/** Supported input types for document template fields */
export type FieldType = 'text' | 'date' | 'textarea' | 'select' | 'currency' | 'phone' | 'email';

/** A single field definition within a letter template */
export interface LetterField {
  /** Unique identifier for the field (used as form key + placeholder name) */
  id: string;
  /** Hebrew display label */
  label: string;
  /** Input type for rendering */
  type: FieldType;
  /** Placeholder text shown when field is empty */
  placeholder?: string;
  /** Options for 'select' type fields */
  options?: string[];
  /** Whether the field must be filled before generating */
  required?: boolean;
  /** Default value to pre-fill */
  defaultValue?: string;
}

// #endregion

// #region Category Types

/** Category identifier — each groups related letter templates */
export type CategoryId =
  | 'tax_authorities'
  | 'national_insurance'
  | 'banking'
  | 'employment'
  | 'general';

/** A document category that groups related templates */
export interface LetterCategory {
  /** Unique category identifier */
  id: CategoryId;
  /** Hebrew display label */
  label: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Color theme key for styling the category card */
  color: string;
}

// #endregion

// #region Template Types

/** A complete letter template with fields, content, and metadata */
export interface LetterTemplate {
  /** Unique template identifier */
  id: string;
  /** Hebrew template title */
  title: string;
  /** Category this template belongs to */
  category: CategoryId;
  /** Short description of what this letter is for */
  description: string;
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Default subject line with {{placeholder}} support */
  defaultSubject: string;
  /** HTML content body with {{placeholder}} support */
  content: string;
  /** Form fields the user fills in before generating */
  fields: LetterField[];
  /** Whether the template content is a draft (needs real content) */
  isPlaceholder?: boolean;
  /** Searchable tags */
  tags?: string[];
}

// #endregion

// #region View State

/** The current view mode of the documents page */
export type ViewMode = 'categories' | 'templates' | 'editor' | 'preview' | 'formFiller';

// #endregion
