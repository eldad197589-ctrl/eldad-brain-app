/* ============================================
   FILE: BrainSVG.tsx
   PURPOSE: BrainSVG component
   DEPENDENCIES: None (local only)
   EXPORTS: BrainSVG (default)
   ============================================ */
// #region Imports

import { SYNAPSES, PENDING, CATEGORIES, type Neuron } from '../data/neurons';
import { resolveNeurons } from '../data/neuronsResolver';


// #endregion

// #region Types

interface BrainSVGProps {
  onNeuronClick: (neuron: Neuron) => void;
}

/* Auto-layout neurons in category clusters */

// #endregion

function computePositions(neurons: Neuron[]) {
  const catNeurons: Record<string, Neuron[]> = {};
  CATEGORIES.forEach(c => catNeurons[c.id] = []);
  neurons.forEach(n => {
    if (catNeurons[n.category]) catNeurons[n.category].push(n);
  });

  // Place categories in a circle around center
  const cx = 550, cy = 310;
  const activeCats = CATEGORIES.filter(c => (catNeurons[c.id]?.length ?? 0) > 0);
  const positions: Record<string, { x: number; y: number }> = {};

  activeCats.forEach((cat, ci) => {
    const angle = (ci / activeCats.length) * Math.PI * 2 - Math.PI / 2;
    const rx = 250, ry = 160;
    const catCx = cx + Math.cos(angle) * rx;
    const catCy = cy + Math.sin(angle) * ry;

    const items = catNeurons[cat.id];
    items.forEach((n, ni) => {
      const subAngle = (ni / Math.max(items.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const sr = 60 + items.length * 10;
      positions[n.id] = {
        x: catCx + Math.cos(subAngle) * sr * 0.5,
        y: catCy + Math.sin(subAngle) * sr * 0.4,
      };
    });
  });

  return positions;
}

// #region Component

/** BrainSVG component — BrainSVG component */
export default function BrainSVG({ onNeuronClick }: BrainSVGProps) {
  // Resolve neurons from Registry — labels/emojis derived from single source of truth
  const RESOLVED_NEURONS = resolveNeurons();
  const positions = computePositions(RESOLVED_NEURONS);
  const neuronMap: Record<string, Neuron> = {};
  RESOLVED_NEURONS.forEach(n => neuronMap[n.id] = n);

  // Generate pending dots
  const pendingDots = PENDING.map((_, i) => {
    const angle = (i / PENDING.length) * Math.PI * 2;
    const rx = 350 + Math.random() * 50;
    const ry = 200 + Math.random() * 30;
    const px = 550 + Math.cos(angle) * rx * (0.6 + Math.random() * 0.3);
    const py = 300 + Math.sin(angle) * ry * (0.5 + Math.random() * 0.4);
    const r = 2 + Math.random() * 2;
    return { px, py, r, delay: Math.random() * 5 };
  });

  // Category cluster labels
  const activeCats = CATEGORIES.filter(c => RESOLVED_NEURONS.some(n => n.category === c.id));

  return (
    <div className="brain-container">
      <svg className="brain-svg" viewBox="0 0 1100 620" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="brainGradient" cx="50%" cy="45%">
            <stop offset="0%" stopColor="#7ba3c9" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="40%" stopColor="#a78bfa" />
            <stop offset="60%" stopColor="#c9a84c" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <filter id="neuronGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodOpacity="0.5" />
          </filter>
          <filter id="neuronGlowHover">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Brain silhouette */}
        <ellipse cx="550" cy="300" rx="420" ry="260" className="brain-outline" />
        <ellipse cx="550" cy="300" rx="420" ry="260" className="brain-fill" />

        {/* Category cluster labels */}
        {activeCats.map((cat, ci) => {
          const angle = (ci / activeCats.length) * Math.PI * 2 - Math.PI / 2;
          const lx = 550 + Math.cos(angle) * 250;
          const ly = 310 + Math.sin(angle) * 160;
          return (
            <g key={cat.id}>
              <circle cx={lx} cy={ly} r={80} fill={cat.color} fillOpacity={0.03} stroke={cat.color} strokeOpacity={0.12} strokeWidth={1} strokeDasharray="4 4" />
              <text x={lx} y={ly - 72} textAnchor="middle" fill={cat.color} fontFamily="Heebo" fontSize="11" fontWeight="700" fillOpacity={0.6}>
                {cat.emoji} {cat.label}
              </text>
            </g>
          );
        })}

        {/* Synapses */}
        {SYNAPSES.map((s, i) => {
          const from = positions[s.from];
          const to = positions[s.to];
          if (!from || !to) return null;

          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2 - 40;
          const path = `M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`;

          return (
            <g key={`synapse-${i}`}>
              <path d={path} className="synapse-line" />
              <path
                d={path}
                className="synapse-pulse"
                style={{
                  animationDelay: `${s.delay}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            </g>
          );
        })}

        {/* Pending dots */}
        {pendingDots.map((dot, i) => (
          <circle
            key={`pending-${i}`}
            cx={dot.px}
            cy={dot.py}
            r={dot.r}
            className="pending-dot"
            style={{ animationDelay: `${dot.delay}s` }}
          />
        ))}

        {/* Neurons */}
        {RESOLVED_NEURONS.map(n => {
          const pos = positions[n.id];
          if (!pos) return null;
          return (
            <g
              key={n.id}
              className="neuron-group"
              onClick={() => onNeuronClick(n)}
              data-id={n.id}
            >
              <circle cx={pos.x} cy={pos.y} r={34} className="neuron-outer" stroke={n.color} />
              <circle cx={pos.x} cy={pos.y} r={26} className="neuron-core" fill={n.color} fillOpacity={0.15} stroke={n.color} />
              <text x={pos.x} y={pos.y - 2} className="neuron-emoji">{n.emoji}</text>
              <text x={pos.x} y={pos.y + 42} className="neuron-label">{n.label}</text>
              <text x={pos.x} y={pos.y + 55} className="neuron-sublabel">{n.sublabel}</text>
              {n.count > 0 && (
                <>
                  <circle cx={pos.x + 20} cy={pos.y - 20} r={10} fill={n.color} stroke="#0f172a" strokeWidth={2} />
                  <text x={pos.x + 20} y={pos.y - 20} className="neuron-count">{n.count}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// #endregion
