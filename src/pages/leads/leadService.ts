/* ============================================
// #region Module

   FILE: leadService.ts
   PURPOSE: CRUD operations for leads + conversion to BrainClient
   DEPENDENCIES: ./leadTypes, ../../services/clientService
   EXPORTS: getLeads, createLead, updateLeadStatus, deleteLead, convertLeadToClient
   ============================================ */

import { Lead, LeadStatus } from './leadTypes';
import { createOrUpdateClient } from '../../services/clientService';

const STORAGE_KEY = 'brain_leads_v1';

// #region Helpers

/** Load all leads from localStorage */
function loadLeads(): Lead[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Persist leads to localStorage */
function saveLeads(leads: Lead[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

// #endregion

// #region API

/**
 * Get all leads sorted by creation date (newest first)
 */
export function getLeads(): Lead[] {
  return loadLeads().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Create a new lead and persist it
 * @param partial - Lead data without id/timestamps
 * @returns The created Lead with generated id
 */
export function createLead(partial: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
  const leads = loadLeads();
  const newLead: Lead = {
    ...partial,
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leads.push(newLead);
  saveLeads(leads);
  return newLead;
}

/**
 * Update a lead's status in the pipeline
 * @param leadId - The lead to update
 * @param newStatus - The new pipeline status
 */
export function updateLeadStatus(leadId: string, newStatus: LeadStatus): void {
  const leads = loadLeads();
  const lead = leads.find(l => l.id === leadId);
  if (lead) {
    lead.status = newStatus;
    lead.updatedAt = new Date().toISOString();
    saveLeads(leads);
  }
}

/**
 * Update a lead's notes
 */
export function updateLeadNotes(leadId: string, notes: string): void {
  const leads = loadLeads();
  const lead = leads.find(l => l.id === leadId);
  if (lead) {
    lead.notes = notes;
    lead.updatedAt = new Date().toISOString();
    saveLeads(leads);
  }
}

/**
 * Delete a lead permanently
 */
export function deleteLead(leadId: string): void {
  const leads = loadLeads().filter(l => l.id !== leadId);
  saveLeads(leads);
}

/**
 * Convert a lead to a BrainClient.
 * - Changes lead status to 'won'
 * - Creates a new BrainClient from the lead data
 * @returns The new client ID for navigation
 */
export async function convertLeadToClient(leadId: string): Promise<string> {
  const leads = loadLeads();
  const lead = leads.find(l => l.id === leadId);
  if (!lead) throw new Error(`Lead ${leadId} not found`);

  // 1. Mark lead as won
  lead.status = 'won';
  lead.updatedAt = new Date().toISOString();
  saveLeads(leads);

  // 2. Create BrainClient using existing clientService
  const clientId = await createOrUpdateClient(lead.name, 0);
  return clientId;
}

// #endregion
