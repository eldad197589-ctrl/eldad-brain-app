/* ============================================
   FILE: AgentManager.tsx
   PURPOSE: Agent Management System UI — orchestrator component
   DEPENDENCIES: react, lucide-react, agentRegistry, systemBrain, geminiService, AgentManagerParts
   EXPORTS: AgentManager (default)
   ============================================ */
/**
 * AgentManager — The Agent Management System UI
 *
 * Lets Eldad give instructions → System Brain dispatches agents → Form 4 at the end.
 * Two modes: 🏗️ Build (new) | 🔍 Audit (existing)
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Zap, Send, ChevronDown, ChevronUp, Trash2, Loader2,
} from 'lucide-react';
import {
  AGENTS, LAYER_CONFIG, getLayerOrder,
  type Mission,
} from '../../../data/agentRegistry';
import {
  planMission, loadMissions, updateStepStatus,
  startNextStep, generateForm4, deleteMission,
} from '../../../services/systemBrain';
import { isAIConfigured } from '../../../services/geminiService';
import { AgentCard, StepRow, Form4Display, btnStyle } from './AgentManagerParts';

// #region Main Component

/**
 * Agent management interface — launch missions, track agent steps, generate Form 4.
 */
export default function AgentManager() {
  const [expanded, setExpanded] = useState(true);
  const [showAgentGrid, setShowAgentGrid] = useState(false);
  const [mode, setMode] = useState<'build' | 'audit'>('build');
  const [systemName, setSystemName] = useState('');
  const [instruction, setInstruction] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [expandedMission, setExpandedMission] = useState<string | null>(null);
  const configured = isAIConfigured();

  // Load missions
  useEffect(() => {
    setMissions(loadMissions());
  }, []);

  const refresh = useCallback(() => setMissions(loadMissions()), []);

  // Launch mission
  const handleLaunch = useCallback(async () => {
    if (!systemName.trim() || !instruction.trim()) return;
    setIsPlanning(true);
    try {
      const mission = await planMission(instruction, mode, systemName);
      setMissions(prev => [mission, ...prev]);
      setExpandedMission(mission.id);
      setSystemName('');
      setInstruction('');
    } finally {
      setIsPlanning(false);
    }
  }, [systemName, instruction, mode]);

  // Step action
  const handleStepAction = useCallback((missionId: string, stepId: string, action: 'start' | 'done' | 'error') => {
    if (action === 'start') {
      startNextStep(missionId);
    } else {
      updateStepStatus(missionId, stepId, action === 'done' ? 'done' : 'error',
        action === 'done' ? 'הושלם בהצלחה' : 'נמצאה בעיה');
    }
    refresh();
  }, [refresh]);

  // Generate Form 4
  const handleForm4 = useCallback((missionId: string) => {
    generateForm4(missionId);
    refresh();
  }, [refresh]);

  // Delete mission
  const handleDelete = useCallback((missionId: string) => {
    deleteMission(missionId);
    refresh();
  }, [refresh]);

  // Active agent IDs (from current missions)
  const activeAgentIds = new Set(
    missions
      .filter(m => m.status === 'executing')
      .flatMap(m => m.steps.filter(s => s.status === 'working').map(s => s.agentId))
  );

  return (
    <div className="glass-card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>
      {/* Header */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', cursor: 'pointer',
          borderBottom: expanded ? '1px solid rgba(201,168,76,0.15)' : 'none',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={20} color="#c9a84c" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
            🤖 מערכת ניהול סוכנים
          </h3>
          <span style={{
            fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px',
            borderRadius: 12, background: 'rgba(201,168,76,0.15)', color: '#c9a84c',
          }}>
            23 סוכנים · 6 שכבות
          </span>
        </div>
        {expanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
      </div>

      {expanded && (
        <div style={{ padding: 20 }}>
          {/* Mode Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {([
              { key: 'build' as const, label: '🏗️ בנייה חדשה', color: '#3b82f6' },
              { key: 'audit' as const, label: '🔍 ביקורת מערכת', color: '#f59e0b' },
            ]).map(m => (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                style={{
                  padding: '8px 18px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 700,
                  border: '1px solid', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                  background: mode === m.key ? `${m.color}20` : 'transparent',
                  borderColor: mode === m.key ? m.color : 'rgba(255,255,255,0.1)',
                  color: mode === m.key ? m.color : '#64748b',
                  transition: 'all 0.2s',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Instruction Input */}
          <div style={{
            padding: 16, borderRadius: 12, marginBottom: 14,
            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <input
              type="text"
              value={systemName}
              onChange={e => setSystemName(e.target.value)}
              placeholder="שם המערכת..."
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, marginBottom: 8,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', fontSize: '0.88rem', fontFamily: 'Heebo, sans-serif',
                direction: 'rtl', outline: 'none', boxSizing: 'border-box',
              }}
            />
            <textarea
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              placeholder={mode === 'build'
                ? 'תאר מה המערכת צריכה לעשות... (מה המהות, מה אתה מצפה, למי מיועדת)'
                : 'מה הבעיות? מה צריך לתקן? (סינכרון, מובייל, הדפסה, באגים...)'
              }
              rows={3}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, resize: 'vertical',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'Heebo, sans-serif',
                direction: 'rtl', outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <button
                onClick={() => setShowAgentGrid(!showAgentGrid)}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: '0.72rem',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', cursor: 'pointer', fontFamily: 'Heebo, sans-serif',
                }}
              >
                {showAgentGrid ? '🔽 הסתר סוכנים' : '🤖 הצג 23 סוכנים'}
              </button>
              <button
                onClick={handleLaunch}
                disabled={!systemName.trim() || !instruction.trim() || isPlanning}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 20px', borderRadius: 10, fontSize: '0.88rem', fontWeight: 700,
                  background: systemName.trim() && instruction.trim() ? 'rgba(201,168,76,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${systemName.trim() && instruction.trim() ? '#c9a84c' : 'rgba(255,255,255,0.1)'}`,
                  color: systemName.trim() && instruction.trim() ? '#c9a84c' : '#64748b',
                  cursor: systemName.trim() && instruction.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'Heebo, sans-serif', transition: 'all 0.2s',
                }}
              >
                {isPlanning ? (
                  <><Loader2 size={16} className="spin" /> המוח מתכנן...</>
                ) : (
                  <><Send size={16} /> {mode === 'build' ? 'התחל בנייה' : 'התחל ביקורת'}</>
                )}
              </button>
            </div>
            {!configured && (
              <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#f59e0b' }}>
                ⚠️ Gemini API לא מוגדר — המוח ישתמש בתוכנית ברירת מחדל
              </div>
            )}
          </div>

          {/* Agent Grid (collapsible) */}
          {showAgentGrid && (
            <div style={{ marginBottom: 16 }}>
              {getLayerOrder().map(layer => {
                const cfg = LAYER_CONFIG[layer];
                const layerAgents = AGENTS.filter(a => a.layer === layer);
                return (
                  <div key={layer} style={{ marginBottom: 10 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
                      padding: '4px 10px', borderRadius: 6,
                      background: `${cfg.color}10`,
                    }}>
                      <span>{cfg.emoji}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: cfg.color }}>
                        {cfg.name} ({layerAgents.length})
                      </span>
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: 6,
                    }}>
                      {layerAgents.map(a => (
                        <AgentCard key={a.id} agent={a} isActive={activeAgentIds.has(a.id)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Missions */}
          {missions.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8', marginBottom: 10 }}>
                📋 משימות ({missions.length})
              </h4>
              {missions.map(mission => {
                const isExpanded = expandedMission === mission.id;
                const doneCount = mission.steps.filter(s => s.status === 'done').length;
                const totalCount = mission.steps.length;
                const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

                return (
                  <div key={mission.id} style={{
                    marginBottom: 8, borderRadius: 12, overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    {/* Mission header */}
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', cursor: 'pointer',
                      }}
                      onClick={() => setExpandedMission(isExpanded ? null : mission.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>{mission.mode === 'build' ? '🏗️' : '🔍'}</span>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0' }}>
                            {mission.title}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                            {mission.systemName} · {doneCount}/{totalCount} שלבים · {progress}%
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {mission.status === 'completed' && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                            טופס 4 ✅
                          </span>
                        )}
                        {mission.status === 'review' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleForm4(mission.id); }}
                            style={btnStyle('#c9a84c')}
                          >
                            📋 הפק טופס 4
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(mission.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
                        >
                          <Trash2 size={14} color="#64748b" />
                        </button>
                        {isExpanded ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.05)' }}>
                      <div style={{
                        height: '100%', width: `${progress}%`,
                        background: progress === 100 ? '#10b981' : '#3b82f6',
                        transition: 'width 0.5s',
                      }} />
                    </div>

                    {/* Expanded: steps */}
                    {isExpanded && (
                      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 4, direction: 'rtl' }}>
                          💬 הוראה: "{mission.instruction}"
                        </div>
                        {mission.steps.map(step => (
                          <StepRow
                            key={step.id}
                            step={step}
                            onAction={(stepId, action) => handleStepAction(mission.id, stepId, action)}
                          />
                        ))}
                        {mission.form4 && <Form4Display mission={mission} />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// #endregion
