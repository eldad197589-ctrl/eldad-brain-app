/* ============================================
// #region Module

   FILE: leadTypes.ts
   PURPOSE: Types and interfaces for the Leads pipeline
   DEPENDENCIES: ../../client-onboarding/types
   EXPORTS: Lead, LeadStatus, LeadSource, LEAD_STATUS_LABELS
   ============================================ */

import { EntityType } from '../client-onboarding/types';

// #region Types

/** Lead pipeline statuses as defined in flowchart-client-intake.html */
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'won' | 'lost';

/** Lead acquisition source */
export type LeadSource = 'referral' | 'google' | 'website' | 'social' | 'existing_client' | 'other';

/** A single lead in the pipeline */
export interface Lead {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  entityType: EntityType;
  source: LeadSource;
  referredBy?: string;
  requestedServices: string[];
  isTransfer: boolean;
  status: LeadStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// #endregion

// #region Constants

/** Hebrew labels for each lead status (for UI display) */
export const LEAD_STATUS_LABELS: Record<LeadStatus, { label: string; color: string; icon: string }> = {
  new:           { label: 'חדש',           color: '#8b5cf6', icon: '📞' },
  contacted:     { label: 'יצרנו קשר',    color: '#3b82f6', icon: '📧' },
  qualified:     { label: 'מתאים',         color: '#f59e0b', icon: '✅' },
  proposal_sent: { label: 'הצעה נשלחה',   color: '#06b6d4', icon: '📄' },
  won:           { label: 'נסגר — לקוח!',  color: '#10b981', icon: '🎉' },
  lost:          { label: 'אבוד',          color: '#ef4444', icon: '❌' },
};

/** Hebrew labels for lead sources */
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  referral: 'הפנייה',
  google: 'גוגל',
  website: 'אתר',
  social: 'רשתות חברתיות',
  existing_client: 'לקוח קיים',
  other: 'אחר',
};

/** The pipeline columns in order (for Kanban display) */
export const PIPELINE_COLUMNS: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'];

// #endregion
