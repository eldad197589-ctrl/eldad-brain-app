/* ============================================
   FILE: PipelineAlerts.tsx
   PURPOSE: CEO Dashboard feed — surfaces onboarding pipeline signals
   DEPENDENCIES: react, react-router-dom, lucide-react, brainStore
   EXPORTS: PipelineAlerts (default)
   ============================================ */
/**
 * PipelineAlerts — Real-time pipeline convergence widget for CEO Dashboard.
 *
 * Surfaces:
 *   - Stuck onboarding flows (missing KYC documents)
 *   - Manual override alerts (bank phase bypassed)
 *   - Active case transitions (phase completions)
 *   - Pending document approvals
 *
 * Data sources: brainStore (cases, documents, tasks)
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, FileWarning, UserCheck } from 'lucide-react';
import { useBrainStore } from '../../../store/brainStore';

// #region Types

interface PipelineAlert {
  /** Alert ID */
  id: string;
  /** Alert icon */
  icon: React.ReactNode;
  /** Alert title */
  title: string;
  /** Alert description */
  desc: string;
  /** Severity: 'critical' | 'warn' | 'info' | 'success' */
  level: 'critical' | 'warn' | 'info' | 'success';
  /** Navigation target */
  route?: string;
}

// #endregion

// #region Component

/** PipelineAlerts — CEO dashboard widget for operational pipeline signals */
export default function PipelineAlerts() {
  const navigate = useNavigate();
  const cases = useBrainStore(s => s.cases);
  const documents = useBrainStore(s => s.documents);
  const tasks = useBrainStore(s => s.tasks);
  const employeeSignals = useBrainStore(s => s.employeeSignals);

  const alerts = useMemo<PipelineAlert[]>(() => {
    const items: PipelineAlert[] = [];

    // 1. Pending documents — stuck intake
    const pendingDocs = documents.filter(d => d.status === 'pending');
    if (pendingDocs.length > 0) {
      items.push({
        id: 'pending-docs',
        icon: <FileWarning size={16} color="#f59e0b" />,
        title: `${pendingDocs.length} מסמכים ממתינים לסיווג`,
        desc: 'מסמכים שנקלטו ולא טופלו — דורשים פעולה',
        level: 'warn',
        route: '/ceo',
      });
    }

    // 2. High-priority tasks not done
    const urgentTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'done');
    if (urgentTasks.length > 0) {
      items.push({
        id: 'urgent-tasks',
        icon: <AlertTriangle size={16} color="#ef4444" />,
        title: `${urgentTasks.length} משימות דחופות פתוחות`,
        desc: urgentTasks.slice(0, 2).map(t => t.title).join(', '),
        level: 'critical',
        route: '/ceo',
      });
    }

    // 3. Overdue tasks
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const overdue = tasks.filter(t => {
      if (t.status === 'done') return false;
      const due = new Date(t.dueDate + 'T00:00:00');
      return due < now;
    });
    if (overdue.length > 0) {
      items.push({
        id: 'overdue',
        icon: <Clock size={16} color="#ef4444" />,
        title: `${overdue.length} משימות באיחור`,
        desc: overdue.slice(0, 2).map(t => t.title).join(', '),
        level: 'critical',
        route: '/ceo',
      });
    }

    // 4. Active cases status
    const activeCases = cases.filter(c => c.status !== 'closed');
    if (activeCases.length > 0) {
      items.push({
        id: 'active-cases',
        icon: <CheckCircle size={16} color="#10b981" />,
        title: `${activeCases.length} תיקים פעילים`,
        desc: activeCases.map(c => c.clientName).join(', '),
        level: 'info',
        route: '/clients',
      });
    }

    // 5. Employee signals (unacknowledged only)
    const activeSignals = employeeSignals.filter(s => !s.acknowledged);

    // 5a. Critical: missing_documents
    const missingDocSignals = activeSignals.filter(s => s.signalName === 'missing_documents');
    if (missingDocSignals.length > 0) {
      items.push({
        id: 'emp-missing-docs',
        icon: <FileWarning size={16} color="#ef4444" />,
        title: `${missingDocSignals.length} עובדים עם מסמכים חסרים`,
        desc: missingDocSignals.slice(0, 2).map(s => s.employeeName).join(', '),
        level: 'critical',
      });
    }

    // 5b. Warn: employee_deactivated
    const deactivatedSignals = activeSignals.filter(s => s.signalName === 'employee_deactivated');
    if (deactivatedSignals.length > 0) {
      items.push({
        id: 'emp-deactivated',
        icon: <AlertTriangle size={16} color="#f59e0b" />,
        title: `${deactivatedSignals.length} עובדים סומנו כלא פעילים`,
        desc: deactivatedSignals.slice(0, 2).map(s => s.employeeName).join(', '),
        level: 'warn',
      });
    }

    // 5c. Info: form101_approved, form130_uploaded, attendance_calculated
    const infoSignals = activeSignals.filter(s =>
      s.signalName === 'form101_approved' ||
      s.signalName === 'form130_uploaded' ||
      s.signalName === 'attendance_calculated'
    );
    if (infoSignals.length > 0) {
      items.push({
        id: 'emp-info',
        icon: <UserCheck size={16} color="#60a5fa" />,
        title: `${infoSignals.length} עדכוני מערכת עובדים`,
        desc: infoSignals.slice(0, 2).map(s => {
          if (s.signalName === 'attendance_calculated') return `נוכחות חושבה (${s.payload?.period?.month}/${s.payload?.period?.year})`;
          return `${s.employeeName} — ${s.signalName === 'form101_approved' ? 'טופס 101 אושר' : 'טופס 130 הועלה'}`;
        }).join(', '),
        level: 'info',
      });
    }

    // 5d. Success: employment_agreement_signed
    const signedSignals = activeSignals.filter(s => s.signalName === 'employment_agreement_signed');
    if (signedSignals.length > 0) {
      items.push({
        id: 'emp-agreement-signed',
        icon: <CheckCircle size={16} color="#34d399" />,
        title: `${signedSignals.length} הסכמי העסקה נחתמו`,
        desc: signedSignals.slice(0, 2).map(s => s.employeeName).join(', '),
        level: 'success',
      });
    }

    // 6. If nothing going on — healthy state
    if (items.length === 0) {
      items.push({
        id: 'all-clear',
        icon: <CheckCircle size={16} color="#34d399" />,
        title: 'אין התראות פעילות',
        desc: 'כל התהליכים רצים כמתוכנן',
        level: 'success',
      });
    }

    return items;
  }, [cases, documents, tasks, employeeSignals]);

  const levelColors: Record<string, { bg: string; border: string }> = {
    critical: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
    warn: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
    info: { bg: 'rgba(96,165,250,0.06)', border: 'rgba(96,165,250,0.12)' },
    success: { bg: 'rgba(52,211,153,0.06)', border: 'rgba(52,211,153,0.12)' },
  };

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(59,130,246,0.2)',
      background: 'linear-gradient(135deg, rgba(59,130,246,0.04), rgba(30,41,59,0.95))',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(59,130,246,0.12)',
      }}>
        <AlertTriangle size={18} color="#60a5fa" />
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#60a5fa' }}>
          📡 סטטוס תהליכים
        </span>
        <span style={{
          marginRight: 'auto', fontSize: '0.68rem', color: '#64748b',
          background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 8,
        }}>
          {alerts.filter(a => a.level === 'critical').length} קריטי
          • {alerts.filter(a => a.level === 'warn').length} אזהרה
        </span>
      </div>

      {/* Alert Items */}
      <div style={{ padding: '10px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {alerts.map(alert => {
          const colors = levelColors[alert.level];
          return (
            <div
              key={alert.id}
              onClick={() => alert.route && navigate(alert.route)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                cursor: alert.route ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
            >
              {alert.icon}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.85rem', fontWeight: 600,
                  color: alert.level === 'critical' ? '#f87171' : '#e2e8f0',
                }}>
                  {alert.title}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                  {alert.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// #endregion
