/* ============================================
   FILE: UnifiedIntakeInspectorPage.tsx
   PURPOSE: Hidden internal route host for the read-only unified intake inspector.
   DEPENDENCIES: UnifiedIntakeInspector, unified-intake-static-fixtures
   EXPORTS: UnifiedIntakeInspectorPage (default)
   ============================================ */

// #region Imports
import UnifiedIntakeInspector from '../../components/internal/UnifiedIntakeInspector';
import { UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT } from '../../work-spine/intake/unified-intake-static-fixtures';
// #endregion

// #region Component
export default function UnifiedIntakeInspectorPage() {
  return (
    <main style={{ display: 'grid', gap: 18 }} dir="rtl">
      <UnifiedIntakeInspector snapshot={UNIFIED_INTAKE_STATIC_FIXTURE_SNAPSHOT} />
    </main>
  );
}
// #endregion
