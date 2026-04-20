import React, { useState, useEffect } from 'react';
import { FileBasedWorkItemRepository } from '../persistence/file-based-work-item-repository';
import { RunCreateWorkItemProcess } from '../use-cases/run-create-work-item';
import { RunTransitionWorkItemProcess } from '../use-cases/run-transition-work-item';
import { RunUpdateNextActionProcess } from '../use-cases/run-update-next-action-process';
import { WorkItemStatus, WorkItemRecord, WorkDomainType } from '../types/work-spine-types';
import { AuditTraceService } from '../../accounting-core/services/audit-trace-service';
import { FileBasedAuditTraceRepository } from '../../accounting-core/persistence/file-based-audit-trace-repository';

// Instantiate strictly restricted runtimes
const repo = new FileBasedWorkItemRepository();
const auditRepo = new FileBasedAuditTraceRepository();
const auditService = new AuditTraceService();
(auditService as any).auditTraceRepository = auditRepo;

const createProcess = new RunCreateWorkItemProcess(repo);
const transitionProcess = new RunTransitionWorkItemProcess(repo, auditService);
const updateNextActionProcess = new RunUpdateNextActionProcess(repo, auditService);

export default function TodayControlBoard() {
  const [items, setItems] = useState<WorkItemRecord[]>([]);

  // Form states
  const [title, setTitle] = useState('');
  const [domainType, setDomainType] = useState<WorkDomainType>('ACCOUNTING_CORE');
  const [nextAction, setNextAction] = useState('');
  const [clientId, setClientId] = useState('');
  const [caseId, setCaseId] = useState('');

  const loadData = () => {
    // Sort placing NEW / IN_REVIEW first, CLOSED last
    const sorted = repo.listAll().sort((a, b) => {
      const vA = a.status === 'CLOSED' ? 10 : a.status === 'RESOLVED' ? 8 : 1;
      const vB = b.status === 'CLOSED' ? 10 : b.status === 'RESOLVED' ? 8 : 1;
      if (vA !== vB) return vA - vB;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    setItems(sorted);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !nextAction) return;

    createProcess.execute({
      id: 'wi-' + Date.now(),
      domain_type: domainType,
      title,
      next_action_description: nextAction,
      client_id: clientId || undefined,
      case_id: caseId || undefined,
    });

    setTitle('');
    setNextAction('');
    setClientId('');
    setCaseId('');
    loadData();
  };

  const handleTransition = (item: WorkItemRecord, newStatus: WorkItemStatus) => {
    const reason = window.prompt(`סיבת מעבר סטטוס מ-${item.status} ל-${newStatus} (חובה לבקרה):`);
    if (!reason) {
      alert('פעולה בוטלה - חובה להזין סיבת מעבר.');
      return;
    }

    try {
      transitionProcess.execute({
        work_item_id: item.id,
        new_status: newStatus,
        reason_for_transition: reason,
        actor_id: 'eldad_ui'
      });
      loadData();
    } catch (err: any) {
      alert(`שגיאה במעבר: ${err.message}`);
    }
  };

  const handleUpdateNextAction = (item: WorkItemRecord) => {
    const newText = window.prompt(`עדכן פעולה הבאה עבור: ${item.title}`, item.next_action_description);
    if (!newText || newText === item.next_action_description) return;
    
    const reason = window.prompt(`סיבת העדכון (חובה לתיעוד הבקרה): `, 'התקדמות או חוסר במסמך');
    if (!reason) {
      alert('פעולה בוטלה - חובה להזין סיבה לתיעוד הבקרה.');
      return;
    }

    try {
      updateNextActionProcess.execute({
        work_item_id: item.id,
        next_action_description: newText,
        reason_for_update: reason,
        actor_id: 'eldad_ui'
      });
      loadData();
    } catch (err: any) {
      alert(`שגיאה בעדכון: ${err.message}`);
    }
  };

  const getAllowedTransitions = (status: WorkItemStatus): WorkItemStatus[] => {
    switch (status) {
      case WorkItemStatus.NEW: return [WorkItemStatus.IN_REVIEW];
      case WorkItemStatus.IN_REVIEW: return [WorkItemStatus.WAITING_INTERNAL, WorkItemStatus.WAITING_EXTERNAL, WorkItemStatus.RESOLVED];
      case WorkItemStatus.WAITING_INTERNAL: return [WorkItemStatus.IN_REVIEW];
      case WorkItemStatus.WAITING_EXTERNAL: return [WorkItemStatus.IN_REVIEW];
      case WorkItemStatus.RESOLVED: return [WorkItemStatus.CLOSED];
      default: return [];
    }
  };

  const getStatusColor = (status: WorkItemStatus) => {
    switch (status) {
      case 'NEW': return '#3b82f6';
      case 'IN_REVIEW': return '#f59e0b';
      case 'WAITING_INTERNAL': return '#ef4444';
      case 'WAITING_EXTERNAL': return '#ec4899';
      case 'RESOLVED': return '#10b981';
      case 'CLOSED': return '#64748b';
      default: return '#fff';
    }
  };

  const getStatusHebrew = (status: WorkItemStatus) => {
    switch (status) {
      case 'NEW': return 'חדש';
      case 'IN_REVIEW': return 'בטיפול (אצלי)';
      case 'WAITING_INTERNAL': return 'ממתין (פנימי)';
      case 'WAITING_EXTERNAL': return 'ממתין לגורם חיצוני';
      case 'RESOLVED': return 'הסתיים';
      case 'CLOSED': return 'הועבר לארכיון';
      default: return status;
    }
  };

  const getDomainHebrew = (domain: WorkDomainType) => {
    switch (domain) {
      case 'ACCOUNTING_CORE': return 'הנהלת חשבונות';
      case 'WAR_COMPENSATION': return 'פיצויי מלחמה';
      case 'ONBOARDING': return 'קליטת לקוחות';
      case 'PERSONAL': return 'אישי / הנהלה';
      case 'GENERAL': return 'עבודה כללית';
      default: return domain;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Create Form */}
      <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #334155' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', color: '#f8fafc', display: 'flex', gap: '8px', alignItems:'center' }}>
          <span>⚡</span> פתיחת משימה חדשה
        </h2>
        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>כותרת המשימה (חובה)</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>שיוך ערוץ (Domain)</label>
            <select value={domainType} onChange={e => setDomainType(e.target.value as WorkDomainType)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }}>
              <option value="ACCOUNTING_CORE">הנהלת חשבונות (Core)</option>
              <option value="WAR_COMPENSATION">פיצויי מלחמה</option>
              <option value="ONBOARDING">קליטת לקוח</option>
              <option value="PERSONAL">אישי / הנהלה</option>
              <option value="GENERAL">משימה כללית</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>הפעולה הבאה (חובה)</label>
            <input required value={nextAction} onChange={e => setNextAction(e.target.value)} style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>מזהה לקוח (Client ID)</label>
            <input value={clientId} onChange={e => setClientId(e.target.value)} placeholder="אופציונלי" style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.85rem', color: '#94a3b8' }}>מזהה תיק (Case ID)</label>
            <input value={caseId} onChange={e => setCaseId(e.target.value)} placeholder="אופציונלי" style={{ padding: '10px', background: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button type="submit" style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              הוסף משימה לשולחן
            </button>
          </div>
        </form>
      </div>

      {/* Control Board Grid */}
      <h2 style={{ fontSize: '1.2rem', color: '#f8fafc', marginBottom: '16px' }}>שולחן עבודה (משימות יומיות)</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map(item => {
          const transitions = getAllowedTransitions(item.status);
          const isClosed = item.status === 'CLOSED';
          
          return (
            <div key={item.id} style={{ 
              display: 'grid', 
              gridTemplateColumns: 'minmax(250px, 1.5fr) 1fr 1fr 1fr', 
              gap: '16px', 
              background: '#0f172a', 
              padding: '16px', 
              borderRadius: '8px', 
              border: `1px solid ${getStatusColor(item.status)}40`,
              opacity: isClosed ? 0.6 : 1,
              alignItems: 'center'
            }}>
              
              {/* Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: '#334155', color: '#cbd5e1' }}>{getDomainHebrew(item.domain_type)}</span>
                  {(item.client_id || item.case_id) && (
                     <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>| תיק / לקוח: {item.client_id || ''} {item.case_id || ''}</span>
                  )}
                </div>
                <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '1.1rem' }}>{item.title}</div>
              </div>

              {/* Status */}
              <div>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  borderRadius: '16px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold', 
                  background: `${getStatusColor(item.status)}20`, 
                  color: getStatusColor(item.status),
                  border: `1px solid ${getStatusColor(item.status)}40`
                }}>
                  {getStatusHebrew(item.status)}
                </span>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>עודכן: {new Date(item.updated_at).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
              </div>

              {/* Next Action */}
              <div style={{ background: '#1e293b', padding: '12px', borderRadius: '6px', fontSize: '0.9rem', color: '#e2e8f0', borderLeft: '3px solid #c9a84c' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>הפעולה הבאה</div>
                  {!isClosed && (
                    <button onClick={() => handleUpdateNextAction(item)} style={{ background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontSize: '0.7rem', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>
                      עדכן פעולה ✎
                    </button>
                  )}
                </div>
                {item.next_action_description}
              </div>

              {/* Allowed Transitions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {transitions.length > 0 ? transitions.map(t => (
                  <button 
                    key={t}
                    onClick={() => handleTransition(item, t)}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${getStatusColor(t)}80`,
                      color: getStatusColor(t),
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.background = `${getStatusColor(t)}20`}
                    onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                  >
                     העבר אל: {getStatusHebrew(t)} ➔
                  </button>
                )) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>ננעל בארכיון</span>
                )}
              </div>

            </div>
          );
        })}
        {items.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>שולחן העבודה ריק. אפשר לקחת הפסקה.</div>
        )}
      </div>

    </div>
  );
}
