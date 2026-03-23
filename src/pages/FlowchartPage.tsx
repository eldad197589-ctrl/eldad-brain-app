/* ============================================
   FILE: FlowchartPage.tsx
   PURPOSE: FlowchartPage component
   DEPENDENCIES: react-router-dom, lucide-react
   EXPORTS: FlowchartPage (default)
   ============================================ */
import { useParams, Link } from 'react-router-dom';
import { FLOWCHARTS } from '../data/flowcharts';
import type { FlowStep, Decision, DetailItem, IronRule } from '../data/flowchartTypes';
import { Home } from 'lucide-react';

export default function FlowchartPage() {
  const { flowId } = useParams<{ flowId: string }>();
  const flow = FLOWCHARTS[flowId || ''];

  if (!flow) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🧠</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>תרשים זרימה לא נמצא</h2>
        <p style={{ color: '#94a3b8', marginBottom: 24 }}>התרשים "{flowId}" עדיין לא הועבר למערכת</p>
        <Link to="/" style={{ color: '#d4af37', fontWeight: 600, textDecoration: 'none' }}>← חזרה לדשבורד</Link>
      </div>
    );
  }

  // Build decision map: afterStep → decision
  const decisionMap: Record<number, Decision> = {};
  flow.decisions?.forEach((d: { afterStep: number; decision: Decision }) => { decisionMap[d.afterStep] = d.decision; });

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="flow-badge">
          <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
          {flow.badge}
        </div>
        <h1 className="flow-title">{flow.title}</h1>
        <p style={{ color: '#cbd5e1', fontSize: '1rem', margin: 0 }}>{flow.subtitle}</p>
      </header>

      {/* Nav */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 36, flexWrap: 'wrap' }}>
        <Link to="/" className="flow-nav-btn"><Home size={16} /> דשבורד</Link>
        {flow.relatedLinks?.map((link: { to: string; label: string }, i: number) => (
          <Link key={i} to={link.to} className="flow-nav-btn">{link.label}</Link>
        ))}
      </div>

      {/* Steps */}
      <div className="flow-container">
        {flow.steps.map((step: FlowStep, i: number) => (
          <div key={step.num}>
            <StepCard step={step} />
            
            {/* Decision after this step? */}
            {decisionMap[step.num] && (
              <>
                <Connector />
                <DecisionDiamond decision={decisionMap[step.num]} />
              </>
            )}

            {/* Connector (except after last step) */}
            {i < flow.steps.length - 1 && <Connector />}
          </div>
        ))}
      </div>

      {/* Iron Rules */}
      {flow.ironRules && flow.ironRules.length > 0 && (
        <div className="iron-rules-box">
          <h3>⛔ כללי ברזל של המערכת (Non-Negotiable)</h3>
          <ul>
            {flow.ironRules.map((rule: IronRule, i: number) => (
              <li key={i}>{rule.text}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Result Banner */}
      <div className="flow-result">
        <h3>🎯 {flow.result.title}</h3>
        <p>{flow.result.text}</p>
        {flow.result.emphasis && <p style={{ fontWeight: 700, color: '#f8fafc', marginTop: 8 }}>{flow.result.emphasis}</p>}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '0.78rem' }}>
        <p>המוח של אלדד · תרשים זרימה #{flow.flowNum} · נבנה על ידי רוביום</p>
      </div>
    </div>
  );
}

/* ═══ Sub-components ═══ */

function StepCard({ step }: { step: FlowStep }) {
  return (
    <div className="flow-step-card" style={{ borderTop: `4px solid ${step.color}` }}>
      {/* Header */}
      <div className="flow-step-header">
        <div className="flow-step-num" style={{ background: `${step.color}22`, color: step.color }}>
          {step.num}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>{step.emoji} {step.title}</h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>{step.subtitle}</p>
        </div>
        {step.badge && (
          <span className={`flow-badge-small badge-${step.badge.type}`}>{step.badge.text}</span>
        )}
      </div>

      {/* Detail Grid */}
      <div className="flow-detail-grid">
        {step.details.map((item: DetailItem, i: number) => (
          <div key={i} className="flow-detail-item">
            <div className="flow-detail-icon" style={{ background: item.iconBg }}>{item.icon}</div>
            <div className="flow-detail-text">
              <strong>{item.title}</strong>
              <span dangerouslySetInnerHTML={{ __html: item.text }} />
              {item.tags && (
                <div style={{ marginTop: 4 }}>
                  {item.tags.map((tag, j) => (
                    <span key={j} className="flow-code-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formula Box */}
      {step.formulas && (
        <div className="flow-formula-box">
          <div className="flow-formula-title">{step.formulas.title}</div>
          {step.formulas.lines.map((line, i) => (
            <div key={i} className="flow-formula-line">
              {line.variable && <span className="fvar">{line.variable}</span>}
              {line.operator && <span className="fop"> {line.operator} </span>}
              <span>{line.expression}</span>
              {line.comment && <span className="fcomment"> // {line.comment}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Connector() {
  return (
    <div className="flow-connector">
      <div className="flow-line" />
    </div>
  );
}

function DecisionDiamond({ decision }: { decision: Decision }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
      <div className="flow-diamond">
        <h3>🔀 {decision.title}</h3>
        {decision.question && <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 12 }}>{decision.question}</p>}
        <div className="flow-branches">
          {decision.branches.map((b, i) => (
            <div key={i} className={`flow-branch branch-${b.type}`}>
              {b.label}
              {b.sub && <><br /><small>{b.sub}</small></>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
