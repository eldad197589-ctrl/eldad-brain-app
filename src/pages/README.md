# Pages — Architecture Guide

## Overview

Each page in `src/pages/` is either:
- **A simple page** — a single `.tsx` file (under ~200 lines)
- **A feature folder** — a folder with orchestrator pattern (for pages over ~200 lines)

## Feature Folder Template

When a page exceeds ~200 lines, refactor it into this structure:

```
src/pages/<feature-name>/
├── index.ts              ← Barrel exports (default + named)
├── <FeatureName>.tsx      ← Orchestrator (layout wrapper, ≤200 lines)
├── types.ts              ← Feature-specific interfaces
├── constants.ts          ← Static data, config, colors
├── hooks.ts              ← Custom hooks (state, computed values)
├── calendarUtils.ts      ← Pure utility functions (rename based on domain)
├── components/           ← Sub-components (≤300 lines each)
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   └── modals/           ← Modal/dialog components
│       └── SomeModal.tsx
```

## Rules

| Rule | Limit |
|------|-------|
| Max lines per file | 300 (hard limit: 400) |
| Max folder depth | 3 levels from `src/` |
| Interface style | Named `interface Props {}` (never inline) |
| Documentation | JSDoc on every export |
| File sections | Use `#region` / `#endregion` blocks |

## Pages Needing Refactoring

| Page | Size | Status |
|------|------|--------|
| `ceo-office/` | 48.6KB | ✅ Refactored |
| `Dashboard.tsx` | 24KB | ⚠️ Pending |
| `FoundersPage.tsx` | 21KB | ⚠️ Pending |
| `ProductsPage.tsx` | 15.4KB | ⚠️ Pending |
| `RobiumHub.tsx` | 12.1KB | ⚠️ Pending |

## Updating main.tsx

When creating a new feature folder, update the lazy import in `main.tsx`:

```tsx
// Before:
const MyPage = lazy(() => import('./pages/MyPage'))

// After (barrel import):
const MyPage = lazy(() => import('./pages/my-page'))
```
