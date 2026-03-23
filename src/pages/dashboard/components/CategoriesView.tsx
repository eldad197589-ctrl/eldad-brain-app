/**
 * CategoriesView — Category grid with progress and neuron items
 */
import { ChevronLeft, Clock } from 'lucide-react';
import { NEURONS, CATEGORIES, PENDING } from '../../../data/neurons';
import type { Neuron } from '../types';

interface Props {
  neuronCount: number;
  flowchartCount: number;
  builtCount: number;
  inProgressCount: number;
  pendingCount: number;
  onNeuronClick: (n: Neuron) => void;
}

export default function CategoriesView({
  neuronCount, flowchartCount, builtCount, inProgressCount, pendingCount, onNeuronClick,
}: Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>המוח של אלדד</h2>
        <p style={{ fontSize: '0.82rem', color: '#a0aec0', margin: 0 }}>
          {CATEGORIES.length} קטגוריות · {neuronCount} תהליכים מתועדים · {flowchartCount} תרשימי זרימה
        </p>
      </div>

      {/* Build Progress Summary */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4ade80' }}>✅ {builtCount} נבנו</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fbbf24' }}>🔨 {inProgressCount} בבנייה</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(160,174,192,0.1)', border: '1px solid rgba(160,174,192,0.2)' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a0aec0' }}>⏳ {pendingCount} ממתינים</span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div style={{ maxWidth: 500, margin: '0 auto 28px', padding: '0 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a0aec0' }}>התקדמות כללית</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ade80' }}>{Math.round((builtCount / neuronCount) * 100)}%</span>
        </div>
        <div style={{ height: 6, background: 'rgba(30,45,66,0.8)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${(builtCount / neuronCount) * 100}%`,
            background: 'linear-gradient(90deg, #4ade80, #22d3ee)',
            borderRadius: 10, transition: 'width 0.5s',
          }} />
        </div>
      </div>

      {/* Category Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {CATEGORIES.map(cat => {
          const catNeurons = NEURONS.filter(n => n.category === cat.id);
          if (catNeurons.length === 0) return (
            <div key={cat.id} style={{
              background: 'rgba(30,45,66,0.5)', border: '1px dashed rgba(160,174,192,0.15)',
              borderRadius: 14, padding: '20px 22px', opacity: 0.5,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: '1.3rem' }}>{cat.emoji}</span>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{cat.label}</h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#a0aec0', margin: 0 }}>{cat.description}</p>
              <p style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: 8 }}>🔲 עדיין לא מתועד</p>
            </div>
          );

          const catBuilt = catNeurons.filter(n => n.buildStatus === 'built').length;
          return (
            <div key={cat.id} style={{
              background: 'rgba(45, 69, 98, 0.7)', border: '1px solid rgba(160,180,200,0.18)',
              borderRadius: 14, padding: '20px 22px', borderTop: `3px solid ${cat.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: '1.3rem' }}>{cat.emoji}</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{cat.label}</h3>
                  <p style={{ fontSize: '0.72rem', color: '#a0aec0', margin: 0 }}>{cat.description}</p>
                </div>
                <span style={{
                  marginRight: 'auto', padding: '2px 8px', borderRadius: 6,
                  fontSize: '0.68rem', fontWeight: 700,
                  background: `${cat.color}15`, color: cat.color,
                  border: `1px solid ${cat.color}33`,
                }}>
                  {catNeurons.length} תהליכים
                </span>
              </div>

              {/* Category progress bar */}
              {catNeurons.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: '0.65rem', color: '#a0aec0' }}>{catBuilt}/{catNeurons.length} נבנו</span>
                    <span style={{ fontSize: '0.65rem', color: catBuilt === catNeurons.length ? '#4ade80' : '#fbbf24' }}>
                      {Math.round((catBuilt / catNeurons.length) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(30,45,66,0.8)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${(catBuilt / catNeurons.length) * 100}%`,
                      background: catBuilt === catNeurons.length ? '#4ade80' : 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                      borderRadius: 10, transition: 'width 0.4s',
                    }} />
                  </div>
                </div>
              )}

              {/* Neuron Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {catNeurons.map(n => {
                  const statusBadge = n.buildStatus === 'built'
                    ? { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', text: '✅ נבנה' }
                    : n.buildStatus === 'in-progress'
                    ? { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', text: '🔨 בבנייה' }
                    : { bg: 'rgba(160,174,192,0.1)', color: '#a0aec0', text: '⏳ ממתין' };
                  return (
                    <div key={n.id} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10,
                      background: 'rgba(32,50,72,0.5)',
                      border: '1px solid rgba(160,180,200,0.12)',
                      cursor: n.links.length > 0 ? 'pointer' : 'default',
                      transition: 'all 0.15s',
                    }}
                      onClick={() => n.links.length > 0 && onNeuronClick(n)}
                      onMouseEnter={e => { if (n.links.length > 0) e.currentTarget.style.borderColor = `${n.color}44` }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(160,180,200,0.12)' }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{n.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.label}</div>
                        <div style={{ fontSize: '0.7rem', color: '#a0aec0' }}>{n.sublabel}</div>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 6,
                        fontSize: '0.6rem', fontWeight: 700,
                        background: statusBadge.bg, color: statusBadge.color,
                        border: `1px solid ${statusBadge.color}30`,
                      }}>
                        {statusBadge.text}
                      </span>
                      {n.links.length > 0 && (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          {n.links.filter(l => l.type === 'flowchart').length > 0 && (
                            <span style={{
                              padding: '2px 6px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 600,
                              background: 'rgba(16,185,129,0.1)', color: '#34d399',
                            }}>
                              {n.links.filter(l => l.type === 'flowchart').length} תרשימים
                            </span>
                          )}
                          {n.links.filter(l => l.type === 'case').length > 0 && (
                            <span style={{
                              padding: '2px 6px', borderRadius: 4, fontSize: '0.62rem', fontWeight: 600,
                              background: 'rgba(56,189,248,0.1)', color: '#38bdf8',
                            }}>
                              {n.links.filter(l => l.type === 'case').length} תיקים
                            </span>
                          )}
                          <ChevronLeft size={14} color="#475569" />
                        </div>
                      )}
                      {n.count > 0 && (
                        <span style={{
                          width: 22, height: 22, borderRadius: '50%', background: n.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 800, color: '#0f172a', flexShrink: 0,
                        }}>{n.count}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pending */}
      <div style={{ marginTop: 28 }}>
        <div className="section-header">
          <h2>
            <Clock size={20} />
            ⏳ תהליכים בהמתנה ({PENDING.length} נותרו)
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {PENDING.slice(0, 12).map((text, i) => (
            <div key={i} style={{
              padding: '10px 14px', fontSize: '0.78rem', color: '#e2e8f0',
              background: 'rgba(45,69,98,0.6)', border: '1px solid rgba(160,180,200,0.14)',
              borderRadius: 8, textAlign: 'right',
            }}>
              {text}
            </div>
          ))}
          {PENDING.length > 12 && (
            <div style={{
              padding: '10px 14px', fontSize: '0.78rem', color: '#a0aec0',
              background: 'rgba(30,45,66,0.3)', border: '1px dashed rgba(160,174,192,0.15)',
              borderRadius: 8, textAlign: 'center', fontStyle: 'italic',
            }}>
              +{PENDING.length - 12} נושאים נוספים...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
