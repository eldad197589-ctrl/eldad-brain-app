import { Link } from 'react-router-dom';
import { type Neuron, type NeuronLink } from '../data/neurons';
import { X } from 'lucide-react';

interface NeuronPanelProps {
  neuron: Neuron | null;
  onClose: () => void;
}

const typeIcons: Record<string, string> = { flowchart: '📊', tool: '🛠️', case: '📁' };
const typeColors: Record<string, string> = {
  flowchart: 'rgba(167, 139, 250, 0.13)',
  tool: 'rgba(56, 189, 248, 0.13)',
  case: 'rgba(251, 191, 36, 0.13)'
};

export default function NeuronPanel({ neuron, onClose }: NeuronPanelProps) {
  const isOpen = neuron !== null;

  return (
    <>
      <div
        className={`panel-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />
      <div className={`neuron-panel ${isOpen ? 'open' : ''}`}>
        {neuron && (
          <>
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 16, left: 16,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8, padding: '6px 8px',
                cursor: 'pointer', color: '#94a3b8'
              }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, marginTop: 8 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${neuron.color}22`,
                border: `2px solid ${neuron.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {neuron.emoji}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{neuron.label}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>{neuron.sublabel}</p>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, marginBottom: 12 }}>
              תרשימים, כלים ותיקים
            </div>

            {neuron.links.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: '0.85rem' }}>
                ⏳ תהליך זה טרם תועד כתרשים זרימה.<br />יתווסף בהמשך!
              </div>
            ) : (
              neuron.links.map((link: NeuronLink, i: number) => (
                <Link key={i} to={link.href} className="panel-link" onClick={onClose}>
                  <div className="panel-link-icon" style={{ background: typeColors[link.type] || 'rgba(255,255,255,0.05)' }}>
                    {typeIcons[link.type] || '📄'}
                  </div>
                  <div className="panel-link-text">
                    <h4>{link.title}</h4>
                    <p>{link.sub}</p>
                  </div>
                </Link>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
