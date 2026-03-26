/* ============================================
// #region Module

   FILE: LeadsManagerPage.tsx
   PURPOSE: Kanban board for the Lead→Client pipeline (as defined in flowchart #13)
   DEPENDENCIES: react, react-router-dom, lucide-react, leadTypes, leadService
   EXPORTS: default
   ============================================ */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Plus, Phone, Mail, Building2, ChevronDown, UserCheck, Trash2, StickyNote, X } from 'lucide-react';
import { Lead, LeadStatus, LeadSource, LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from './leadTypes';
import { getLeads, createLead, updateLeadStatus, convertLeadToClient, deleteLead } from './leadService';
import { EntityType } from '../client-onboarding/types';

// #region Component

const LeadsManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>(() => getLeads());
  const [showNewForm, setShowNewForm] = useState(false);
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);

  const reload = useCallback(() => setLeads(getLeads()), []);

  /** Move lead to a new status column */
  const handleDrop = (targetStatus: LeadStatus) => {
    if (!draggedLead) return;
    updateLeadStatus(draggedLead, targetStatus);
    setDraggedLead(null);
    reload();
  };

  /** Convert a lead to a full client */
  const handleConvert = async (leadId: string) => {
    setConverting(leadId);
    try {
      await convertLeadToClient(leadId);
      reload();
      // Navigate to onboarding with the new client
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        navigate(`/onboarding`);
      }
    } catch (err) {
      console.error('[LeadsManager] Conversion failed:', err);
    } finally {
      setConverting(null);
    }
  };

  /** Delete a lead */
  const handleDelete = (leadId: string) => {
    deleteLead(leadId);
    reload();
  };

  // Active pipeline columns (exclude won/lost from the main board)
  const activeColumns: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal_sent'];
  const closedLeads = leads.filter(l => l.status === 'won' || l.status === 'lost');

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-6 relative overflow-hidden font-heebo" dir="rtl">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-radial from-[rgba(139,92,246,0.08)] to-transparent opacity-50 pointer-events-none rounded-full blur-[100px]" />

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate('/hub')} className="flex items-center gap-2 text-[#94a3b8] hover:text-white transition-colors mb-3 text-sm font-medium">
              <ArrowRight size={16} /> חזרה למרכז השליטה
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center border border-[rgba(139,92,246,0.3)] text-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                <Phone size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">ניהול לידים — Pipeline</h1>
                <p className="text-[#94a3b8] font-medium mt-1">מליד ראשוני ועד לקוח פעיל — גרור כרטיסים בין עמודות</p>
              </div>
            </div>
          </div>
          <button onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
            <Plus size={18} /> ליד חדש
          </button>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {activeColumns.map(status => {
            const config = LEAD_STATUS_LABELS[status];
            const columnLeads = leads.filter(l => l.status === status);
            return (
              <div key={status}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(status)}
                className="bg-[rgba(30,41,59,0.3)] border border-[rgba(148,163,184,0.1)] rounded-2xl p-4 min-h-[400px] transition-all"
                style={{ borderTopColor: config.color, borderTopWidth: 3 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <span>{config.icon}</span> {config.label}
                  </h3>
                  <span className="bg-[rgba(255,255,255,0.08)] text-[#94a3b8] text-xs font-bold px-2.5 py-1 rounded-full">
                    {columnLeads.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnLeads.map(lead => (
                    <LeadCard key={lead.id} lead={lead}
                      onDragStart={() => setDraggedLead(lead.id)}
                      onConvert={() => handleConvert(lead.id)}
                      onDelete={() => handleDelete(lead.id)}
                      isConverting={converting === lead.id}
                      showConvert={status === 'proposal_sent'} />
                  ))}
                  {columnLeads.length === 0 && (
                    <div className="text-center py-10 text-[#334155] text-sm font-medium">
                      גרור לכאן
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Closed Leads */}
        {closedLeads.length > 0 && (
          <div className="bg-[rgba(30,41,59,0.2)] border border-[rgba(148,163,184,0.08)] rounded-2xl p-5">
            <h3 className="text-sm font-bold text-[#64748b] mb-3 flex items-center gap-2">
              <ChevronDown size={16} /> לידים סגורים ({closedLeads.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {closedLeads.map(lead => (
                <div key={lead.id} className={`p-3 rounded-xl border text-sm ${
                  lead.status === 'won'
                    ? 'bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.2)] text-[#10b981]'
                    : 'bg-[rgba(239,68,68,0.05)] border-[rgba(239,68,68,0.2)] text-[#ef4444]'
                }`}>
                  <div className="font-bold">{lead.name}</div>
                  <div className="text-xs opacity-70">{LEAD_STATUS_LABELS[lead.status].label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* New Lead Modal */}
      {showNewForm && (
        <NewLeadModal onClose={() => setShowNewForm(false)} onCreated={() => { reload(); setShowNewForm(false); }} />
      )}
    </div>
  );
};

// #endregion

// #region LeadCard

interface LeadCardProps {
  lead: Lead;
  onDragStart: () => void;
  onConvert: () => void;
  onDelete: () => void;
  isConverting: boolean;
  showConvert: boolean;
}

function LeadCard({ lead, onDragStart, onConvert, onDelete, isConverting, showConvert }: LeadCardProps) {
  return (
    <div draggable onDragStart={onDragStart}
      className="bg-[#111827] border border-[#334155] rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-[#64748b] transition-all shadow-lg group">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-bold text-white text-sm">{lead.name}</h4>
        <button onClick={onDelete} className="text-[#334155] hover:text-[#ef4444] transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="space-y-1.5 text-xs text-[#94a3b8]">
        {lead.phone && <div className="flex items-center gap-1.5"><Phone size={12} /> {lead.phone}</div>}
        {lead.email && <div className="flex items-center gap-1.5"><Mail size={12} /> {lead.email}</div>}
        <div className="flex items-center gap-1.5"><Building2 size={12} /> {lead.entityType}</div>
        <div className="flex items-center gap-1.5"><StickyNote size={12} /> {LEAD_SOURCE_LABELS[lead.source]}</div>
      </div>
      {lead.notes && (
        <p className="text-xs text-[#64748b] mt-2 pt-2 border-t border-[#1e293b] line-clamp-2">{lead.notes}</p>
      )}
      {lead.isTransfer && (
        <span className="inline-block mt-2 text-[10px] font-bold text-[#38bdf8] bg-[rgba(56,189,248,0.1)] px-2 py-0.5 rounded-full border border-[rgba(56,189,248,0.2)]">
          מעבר ממייצג
        </span>
      )}
      {showConvert && (
        <button onClick={onConvert} disabled={isConverting}
          className="w-full mt-3 py-2 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50">
          <UserCheck size={14} />
          {isConverting ? 'ממיר...' : 'המר ללקוח ←'}
        </button>
      )}
    </div>
  );
}

// #endregion

// #region NewLeadModal

const ENTITY_OPTIONS: { id: EntityType; label: string }[] = [
  { id: 'exempt', label: 'עוסק פטור' },
  { id: 'authorized', label: 'עוסק מורשה' },
  { id: 'partnership', label: 'שותפות' },
  { id: 'company', label: 'חברה בע"מ' },
  { id: 'npo', label: 'עמותה / מלכ"ר' },
];

const SOURCE_OPTIONS: { id: LeadSource; label: string }[] = [
  { id: 'referral', label: 'הפנייה' },
  { id: 'google', label: 'גוגל' },
  { id: 'website', label: 'אתר' },
  { id: 'social', label: 'רשתות חברתיות' },
  { id: 'existing_client', label: 'לקוח קיים' },
  { id: 'other', label: 'אחר' },
];

function NewLeadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [entityType, setEntityType] = useState<EntityType>('exempt');
  const [source, setSource] = useState<LeadSource>('referral');
  const [isTransfer, setIsTransfer] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createLead({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      entityType,
      source,
      isTransfer,
      requestedServices: [],
      status: 'new',
      notes,
    });
    onCreated();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="bg-[#111827] border border-[#334155] rounded-2xl p-8 w-full max-w-lg shadow-2xl" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white">📞 ליד חדש</h2>
          <button onClick={onClose} className="text-[#64748b] hover:text-white"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="שם מלא *" value={name} onChange={setName} placeholder="לדוגמה: יוסי כהן" />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="טלפון" value={phone} onChange={setPhone} placeholder="050-1234567" />
            <InputField label="אימייל" value={email} onChange={setEmail} placeholder="yossi@mail.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="סוג ישות" value={entityType} options={ENTITY_OPTIONS} onChange={(v) => setEntityType(v as EntityType)} />
            <SelectField label="מקור ליד" value={source} options={SOURCE_OPTIONS} onChange={(v) => setSource(v as LeadSource)} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer mt-1">
            <div className={`w-10 h-5 rounded-full transition-colors relative ${isTransfer ? 'bg-[#38bdf8]' : 'bg-[#334155]'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isTransfer ? 'left-0.5' : 'left-5'}`} />
            </div>
            <span className="text-sm text-[#e2e8f0]">מעבר ממייצג קודם</span>
            <input type="checkbox" className="hidden" checked={isTransfer} onChange={(e) => setIsTransfer(e.target.checked)} />
          </label>
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">הערות</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0a0e1a] border border-[#334155] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] resize-none h-20"
              placeholder="פרטים נוספים..." />
          </div>
          <button type="submit"
            className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold rounded-xl transition-colors shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            צור ליד
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#94a3b8] mb-1">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#0a0e1a] border border-[#334155] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6]" />
    </div>
  );
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { id: string; label: string }[]; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#94a3b8] mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#0a0e1a] border border-[#334155] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6] appearance-none">
        {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

// #endregion

export default LeadsManagerPage;
