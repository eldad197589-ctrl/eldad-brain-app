# AGENTS.md — AI Agent Guidelines for brain-app

> **Project:** המוח של אלדד (Eldad's Brain)
> **Stack:** React 19 + TypeScript 5.6 + Vite + React Router 7 + Lucide Icons
> **Layout:** RTL (Hebrew) — `dir="rtl"`
> **State:** localStorage (no backend)

---

## 🏗️ Architecture Rules

### Feature Folder Pattern (Orchestrator)
Every page with >200 lines MUST be refactored into a **feature folder**:

```
src/pages/<feature-name>/
├── index.ts              ← Barrel exports (default export + named re-exports)
├── <FeatureName>.tsx      ← Orchestrator — layout wrapper ONLY, no business logic
├── types.ts              ← Domain-specific interfaces/types
├── constants.ts          ← Static data, config, lookup tables
├── hooks.ts              ← Custom React hooks (data, computed values)
├── calendarUtils.ts      ← Pure utility functions (date, formatting, etc.)
├── components/           ← UI sub-components
│   ├── <ComponentName>.tsx
│   └── modals/           ← Modal components (if any)
└── README.md             ← (Optional) Feature documentation
```

### File Rules
| Rule | Detail |
|------|--------|
| **Max file size** | ≤300 lines (hard limit: 400) |
| **One responsibility** | Each file has exactly one reason to change |
| **Named interfaces** | Always `interface Props {}` — never inline types |
| **JSDoc required** | Every exported function, component, hook, and interface |
| **No circular deps** | Dependency tree must be a DAG — parent → child only |
| **Barrel exports** | Every feature folder has `index.ts` with commented exports |

### Component Template
```tsx
/**
 * ComponentName — Brief description of what this renders.
 *
 * @example
 * <ComponentName title="Hello" onAction={() => {}} />
 */

// #region Imports
import { useState } from 'react';
import { SomeIcon } from 'lucide-react';
import type { SomeType } from '../types';
// #endregion

// #region Types
/** Props for the ComponentName component */
interface Props {
  /** The display title */
  title: string;
  /** Callback when user performs the action */
  onAction: () => void;
}
// #endregion

// #region Component
export default function ComponentName({ title, onAction }: Props) {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
// #endregion
```

---

## 📁 Project Structure

```
brain-app/src/
├── main.tsx                    ← App root (routes, lazy loading)
├── index.css                   ← Global styles
├── components/                 ← Shared app-wide components
│   ├── Layout.tsx              ← Main layout wrapper (sidebar + content)
│   ├── BrainSVG.tsx            ← Brain visualization
│   └── NeuronPanel.tsx         ← Neuron info panel
├── data/                       ← Shared data & types
│   ├── calendarTypes.ts        ← Meeting, Task interfaces + seed data
│   ├── clients.ts              ← Client data
│   ├── flowcharts.ts           ← Flowchart definitions
│   ├── flowchartTypes.ts       ← Flowchart types
│   └── neurons.ts              ← Neuron definitions
├── pages/                      ← Route pages
│   ├── ceo-office/             ← ✅ Refactored feature folder
│   │   ├── index.ts
│   │   ├── CeoOffice.tsx       ← Orchestrator
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   ├── hooks.ts
│   │   ├── calendarUtils.ts
│   │   └── components/
│   ├── Dashboard.tsx           ← ⚠️ Needs refactoring (24K)
│   ├── FoundersPage.tsx        ← ⚠️ Needs refactoring (21K)
│   ├── ProductsPage.tsx        ← ⚠️ Needs refactoring (15K)
│   ├── RobiumHub.tsx           ← ⚠️ Needs refactoring (12K)
│   └── ...other pages
└── assets/
```

---

## 🎨 Styling

- **Global CSS** in `index.css` (not CSS modules, not Tailwind utility classes in JSX)
- **Inline styles** used for dynamic values (colors from data, conditional opacity)
- **CSS class naming**: kebab-case (e.g., `glass-card`, `cal-nav-btn`, `agenda-item`)
- **Design system**: Dark theme, glass morphism cards, gradient accents
- **Color palette**: Navy/dark background (`#0a0e1a`), purple/teal/amber accents

---

## ⚠️ Common Gotchas

1. **RTL Layout** — The app is Hebrew RTL. Use `marginRight` where English would use `marginLeft`
2. **localStorage keys** — Defined in `data/calendarTypes.ts` as `STORAGE_KEYS`
3. **Lazy loading** — All pages use `React.lazy()` in `main.tsx`
4. **No backend** — All data persisted in `localStorage`
5. **Icons** — Use `lucide-react`, not emoji (except in data/labels)
6. **Date format** — Always `YYYY-MM-DD` as string (e.g., `'2026-03-15'`)

---

## ✅ Do's

- ✅ Use TypeScript strict mode
- ✅ Use `interface` for object shapes (not `type`)
- ✅ Use `useCallback` for callbacks passed to children
- ✅ Use `useMemo` for expensive computations
- ✅ Name files after their default export (PascalCase for components)
- ✅ Add JSDoc to all exports
- ✅ Keep components under 300 lines
- ✅ Use `#region` blocks for file organization

## ❌ Don'ts

- ❌ Don't use `any` — use `unknown` if unsure
- ❌ Don't put business logic in the orchestrator
- ❌ Don't create circular imports
- ❌ Don't use generic file names (`utils.ts`, `helpers.ts`) — be descriptive
- ❌ Don't inline prop types — always define `interface Props`
- ❌ Don't nest folders deeper than 3 levels from `src/`
- ❌ Don't import from parent components in child components
- ❌ Don't create generic dashboards — always build **professional workflow neurons**

---

## 🧠 Brain Architecture Rules

> This project is **Eldad Brain** — an AI-operable operating system for professional workflows.
> Every professional process is a **Neuron**. Every neuron follows a standard lifecycle.

### System Reality (Current State)
- The system is a **Hybrid System**: React app + legacy HTML flowcharts
- There is **no backend, database, auth, RAG, or live agents** yet
- All data is persisted in `localStorage`
- Agents are **logical roles**, not running services
- HTML flowcharts are **Process Assets**, not legacy to delete

### Core Principles
1. **Every professional task = neuron**
2. **Build from what exists** — do not redesign the whole architecture
3. **Do not break existing routing or component structure**
4. **Do not perform wide folder refactors** unless strictly necessary
5. **Prefer minimal integration** over idealized architecture
6. **Mark future concepts as TODO** — do not assume they exist

### Adding a New Process (Neuron)
When building a new process, follow this exact order:

1. Analyze how it fits the **current codebase**
2. Map the process to a domain (`employee | accounting | legal | reports | support`)
3. Define the process spec (name, goal, inputs, outputs, steps, decisions)
4. Register it in `src/data/processRegistry.ts`
5. Register its neuron in `src/data/neurons.ts`
6. Define only the lifecycle stages **actually needed** (flexible, not all 9)
7. Connect to CEO Office visibility
8. Build the UI inside the **existing** `src/pages/` structure
9. Mark backend/RAG/agent items as `// TODO: future`

### Lifecycle Stages (Pick What You Need)
```
intake → validation → classification → analysis → decision
→ output_generation → review → submission → completed
```
Optional: `blocked`

**Not all stages are required.** A letter needs 3 stages. Capital gains needs 7.

### Process Registry
Every neuron MUST be registered in `src/data/processRegistry.ts` with:
- `id`, `name`, `domain`, `goal` (required)
- `inputs`, `outputs`, `steps` (required)
- `lifecycleStages`, `agentRoles`, `brainKeywords` (optional — add when relevant)

### Brain Domains
| Domain | Hebrew | Examples |
|--------|--------|----------|
| `employee` | עובדים | attendance, payroll, worklaw |
| `accounting` | חשבונאות | capital-gains, declaration, war-compensation |
| `legal` | משפטי | expert-opinion, guardian, insolvency |
| `reports` | דוחות | institutional-reports |
| `core` | ליבה | brain-router, dashboard, ceo-office |
| `support` | תמיכה | clients, letters, case-view |
