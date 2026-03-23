/**
 * BrainView — Brain visualization mode with SVG and stats
 */
import BrainSVG from '../../../components/BrainSVG';
import type { Neuron } from '../../dashboard/types';
import { PENDING } from '../../../data/neurons';

interface Props {
  neuronCount: number;
  flowchartCount: number;
  onNeuronClick: (n: Neuron) => void;
}

export default function BrainView({ neuronCount, flowchartCount, onNeuronClick }: Props) {
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px' }}>המוח של אלדד</h2>
        <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
          {neuronCount} תחומי מומחיות · 147 לקוחות · {flowchartCount} תרשימי זרימה · 22+ שנות ניסיון
        </p>
      </div>

      {/* Stats Bar */}
      <div className="brain-stats-bar">
        <div className="brain-stat">
          <div className="brain-stat-num">{neuronCount}</div>
          <div className="brain-stat-label">נוירונים פעילים</div>
        </div>
        <div className="brain-stat">
          <div className="brain-stat-num">{PENDING.length}</div>
          <div className="brain-stat-label">תהליכים בהמתנה</div>
        </div>
        <div className="brain-stat">
          <div className="brain-stat-num">{flowchartCount}</div>
          <div className="brain-stat-label">תרשימי זרימה</div>
        </div>
        <div className="brain-stat">
          <div className="brain-stat-num">147</div>
          <div className="brain-stat-label">לקוחות</div>
        </div>
      </div>

      <BrainSVG onNeuronClick={(n) => onNeuronClick(n)} />

      <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.78rem', marginTop: 8 }}>
        לחץ על נוירון כדי לראות תרשימים, כלים ותיקי לקוחות · נקודות עמומות = תהליכים בהמתנה
      </p>
    </div>
  );
}
