/* ============================================
   FILE: LearningInboxPage.tsx
   PURPOSE: Hidden internal page for static read-only Brain Learning Inbox.
   DEPENDENCIES: LearningInboxView
   EXPORTS: LearningInboxPage (default)
   ============================================ */

// #region Imports
import LearningInboxView from '../../components/internal/LearningInboxView';
// #endregion

// #region Component
/** LearningInboxPage — Hosts the static internal Learning Inbox view without store or persistence wiring. */
export default function LearningInboxPage() {
  return (
    <main style={{ padding: 24 }}>
      <LearningInboxView />
    </main>
  );
}
// #endregion
