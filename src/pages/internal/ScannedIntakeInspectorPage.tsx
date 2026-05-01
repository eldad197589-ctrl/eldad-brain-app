/* ============================================
   FILE: ScannedIntakeInspectorPage.tsx
   PURPOSE: Hidden internal route host for the read-only scanned intake inspector.
   DEPENDENCIES: ScannedIntakeInspector, scanned-intake-static-snapshot, scanned-intake-task-candidates-static-snapshot
   EXPORTS: ScannedIntakeInspectorPage (default)
   ============================================ */

// #region Imports
import ScannedIntakeInspector from '../../components/internal/ScannedIntakeInspector';
import { SCANNED_INTAKE_STATIC_SNAPSHOT } from '../../work-spine/intake/scanned-intake-static-snapshot';
import { SCANNED_INTAKE_TASK_CANDIDATES_STATIC_SNAPSHOT } from '../../work-spine/intake/scanned-intake-task-candidates-static-snapshot';
// #endregion

// #region Component
export default function ScannedIntakeInspectorPage() {
  return (
    <main style={{ display: 'grid', gap: 18 }} dir="rtl">
      <ScannedIntakeInspector
        snapshot={SCANNED_INTAKE_STATIC_SNAPSHOT}
        taskCandidatesSnapshot={SCANNED_INTAKE_TASK_CANDIDATES_STATIC_SNAPSHOT}
      />
    </main>
  );
}
// #endregion
