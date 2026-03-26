/* ============================================
   FILE: MissionLauncher.tsx
   PURPOSE: UI for launching and monitoring AI agent missions
   DEPENDENCIES: react, lucide-react, systemBrain, agentRegistry, processRegistry
   EXPORTS: MissionLauncher (default)
   ============================================ */
/**
 * MissionLauncher — "הפעל סוכנים"
 *
 * Allows launching AI missions: user provides instructions,
 * selects mode (build/audit), and watches agents execute in real time.
 */

import { useState, useCallback, useRef } from 'react';
import {
  Rocket, Play, Loader2, XCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import type { Mission } from '../../../data/agentRegistry';
import { PROCESS_REGISTRY } from '../../../data/processRegistry';
import {
  planMission, loadMissions, runFullMissionPipeline,
  generateForm4,
} from '../../../services/systemBrain';
import { isAIConfigured } from '../../../services/geminiService';
import { ModeButton, StepRow, MissionStatusBadge, Form4Display } from './MissionSubComponents';

// #region Component

/**
 * MissionLauncher — full mission lifecycle: create → plan → execute → report.
 */
export default function MissionLauncher() {
  const [instruction, setInstruction] = useState('');
  const [mode, setMode] = useState<'process' | 'filing'>('process');
  const [systemName, setSystemName] = useState(PROCESS_REGISTRY[0]?.name || '');
  const [activeMission, setActiveMission] = useState<Mission | null>(null);
  const [planning, setPlanning] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const stepsRef = useRef<HTMLDivElement>(null);

  const aiReady = isAIConfigured();

  /** Create a new mission plan */
  const handlePlan = useCallback(async () => {
    if (!instruction.trim() || planning) return;
    setPlanning(true);
    setError('');
    setActiveMission(null);

    try {
      const mission = await planMission(instruction.trim(), mode, systemName);
      setActiveMission(mission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'תכנון נכשל');
    } finally {
      setPlanning(false);
    }
  }, [instruction, mode, systemName, planning]);

  /** Execute all mission steps */
  const handleExecute = useCallback(async () => {
    if (!activeMission || executing) return;
    setExecuting(true);
    setError('');

    try {
      const result = await runFullMissionPipeline(
        activeMission.id,
        (step) => {
          // Live update after each step completes
          setActiveMission(prev => {
            if (!prev) return prev;
            const updatedSteps = prev.steps.map(s =>
              s.id === step.id ? { ...step } : s
            );
            return { ...prev, steps: updatedSteps };
          });
          // Auto-scroll to latest step
          stepsRef.current?.scrollTo({ top: stepsRef.current.scrollHeight, behavior: 'smooth' });
        }
      );

      if (result) {
        setActiveMission(result);
        // Auto-generate Form4 if all done
        if (result.status === 'review') {
          generateForm4(result.id);
          const updated = loadMissions().find(m => m.id === result.id);
          if (updated) setActiveMission(updated);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ביצוע נכשל');
    } finally {
      setExecuting(false);
    }
  }, [activeMission, executing]);

  /** Past missions from localStorage */
  const pastMissions = showHistory ? loadMissions().slice(0, 5) : [];

  return (
    <div style={{
      borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(251,191,36,0.2)',
      background: 'linear-gradient(135deg, rgba(251,191,36,0.06), rgba(30,41,59,0.95))',
      marginBottom: 16,
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: '1px solid rgba(251,191,36,0.15)',
      }}>
        <Rocket size={18} color="#fbbf24" />
        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24' }}>
          🚀 הפעל סוכנים
        </span>
        {!aiReady && (
          <span style={{
            fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px',
            borderRadius: 10, background: 'rgba(248,113,113,0.15)', color: '#f87171',
            marginRight: 'auto',
          }}>
            צריך API key
          </span>
        )}
      </div>

      {/* Mission Input Form */}
      {!activeMission && (
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Mode Selection */}
          <div style={{ display: 'flex', gap: 8 }}>
            <ModeButton
              label="⚙️ תהליך מלא" value="process" current={mode}
              onClick={() => setMode('process')}
            />
            <ModeButton
              label="📂 תיוק בלבד" value="filing" current={mode}
              onClick={() => setMode('filing')}
            />
          </div>

          {/* System Name Picker */}
          <select
            value={systemName}
            onChange={(e) => setSystemName(e.target.value)}
            style={{
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(251,191,36,0.2)',
              color: '#e2e8f0', fontSize: '0.82rem',
              fontFamily: 'Heebo, sans-serif', direction: 'rtl',
              appearance: 'none', cursor: 'pointer',
            }}
          >
            {PROCESS_REGISTRY.map(p => (
              <option key={p.id} value={p.name} style={{ background: '#1e293b' }}>
                {p.name} ({p.domain})
              </option>
            ))}
          </select>

          {/* Instruction Textarea */}
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="הוראה ל-CEO: מה צריך לעשות?"
            rows={3}
            style={{
              padding: '10px 14px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(251,191,36,0.2)',
              color: '#e2e8f0', fontSize: '0.85rem',
              fontFamily: 'Heebo, sans-serif', direction: 'rtl',
              resize: 'vertical', outline: 'none',
            }}
          />

          {/* Launch Button */}
          <button
            onClick={handlePlan}
            disabled={!instruction.trim() || planning || !aiReady}
            style={{
              padding: '10px 20px', borderRadius: 10, fontSize: '0.85rem', fontWeight: 700,
              background: instruction.trim() && aiReady
                ? 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.3))'
                : 'rgba(255,255,255,0.05)',
              border: `1px solid ${instruction.trim() && aiReady ? '#fbbf24' : 'rgba(255,255,255,0.1)'}`,
              color: instruction.trim() && aiReady ? '#fbbf24' : '#64748b',
              cursor: instruction.trim() && !planning && aiReady ? 'pointer' : 'not-allowed',
              fontFamily: 'Heebo, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
          >
            {planning
              ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> מתכנן משימה...</>
              : <><Rocket size={16} /> תכנן והפעל</>
            }
          </button>
        </div>
      )}

      {/* Active Mission Display */}
      {activeMission && (
        <div style={{ padding: '14px 18px' }}>
          {/* Mission Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
          }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>
              {activeMission.title}
            </span>
            <MissionStatusBadge status={activeMission.status} />
          </div>

          {/* Steps */}
          <div ref={stepsRef} style={{
            display: 'flex', flexDirection: 'column', gap: 6,
            maxHeight: 300, overflowY: 'auto',
          }}>
            {activeMission.steps.map((step) => (
              <StepRow key={step.id} step={step} />
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            {activeMission.status === 'planning' && (
              <button
                onClick={handleExecute}
                disabled={executing}
                style={{
                  flex: 1, padding: '10px', borderRadius: 10, fontSize: '0.82rem',
                  fontWeight: 700, background: 'rgba(52,211,153,0.15)',
                  border: '1px solid #34d399', color: '#34d399',
                  cursor: executing ? 'not-allowed' : 'pointer',
                  fontFamily: 'Heebo, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {executing
                  ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> מריץ סוכנים...</>
                  : <><Play size={14} /> הרץ הכל</>
                }
              </button>
            )}
            <button
              onClick={() => setActiveMission(null)}
              style={{
                padding: '10px 16px', borderRadius: 10, fontSize: '0.78rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
              }}
            >
              משימה חדשה
            </button>
          </div>

          {/* Form4 Report */}
          {activeMission.form4 && (
            <Form4Display report={activeMission.form4} />
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          padding: '10px 18px', color: '#f87171', fontSize: '0.82rem',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <XCircle size={14} /> {error}
        </div>
      )}

      {/* History Toggle */}
      <div style={{
        padding: '8px 18px', borderTop: '1px solid rgba(251,191,36,0.1)',
      }}>
        <button
          onClick={() => setShowHistory(!showHistory)}
          style={{
            background: 'none', border: 'none', color: '#64748b',
            fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          היסטוריית משימות
        </button>
        {showHistory && pastMissions.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pastMissions.map(m => (
              <div key={m.id} style={{
                padding: '6px 10px', borderRadius: 6, fontSize: '0.72rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6,
                cursor: 'pointer',
              }} onClick={() => setActiveMission(m)}>
                <MissionStatusBadge status={m.status} />
                {m.title} · {m.steps.length} שלבים
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// #endregion
