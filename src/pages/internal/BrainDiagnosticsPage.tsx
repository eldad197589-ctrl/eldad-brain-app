/* ============================================
   FILE: BrainDiagnosticsPage.tsx
   PURPOSE: Hidden internal route host for the read-only Brain diagnostics view.
   DEPENDENCIES: BrainDiagnosticsView, brain-diagnostics-static-manifest, brain-spine-read-model
   EXPORTS: BrainDiagnosticsPage (default)
   ============================================ */

// #region Imports
import BrainDiagnosticsView from '../../components/internal/BrainDiagnosticsView';
import { BRAIN_DIAGNOSTICS_STATIC_MANIFEST } from '../../components/internal/brain-diagnostics-static-manifest';
import { getBrainSpineProjectionSnapshot } from '../../work-spine/read-model/brain-spine-read-model';
// #endregion

// #region Component
/** BrainDiagnosticsPage — Hosts the read-only Brain diagnostics internal view. */
export default function BrainDiagnosticsPage() {
  const snapshot = getBrainSpineProjectionSnapshot();

  return <BrainDiagnosticsView snapshot={snapshot} manifest={BRAIN_DIAGNOSTICS_STATIC_MANIFEST} />;
}
// #endregion
