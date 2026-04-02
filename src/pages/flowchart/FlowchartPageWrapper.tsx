/* ============================================
   FILE: FlowchartPageWrapper.tsx
   PURPOSE: Bridge wrapper — composes LiveCaseHeader + FlowchartPage.
            Reads optional caseId from URL query param.
            Without caseId → renders pure static Guide Screen.
            With caseId → renders LiveCaseHeader above the guide.
   DEPENDENCIES: react, react-router-dom, brainStore, LiveCaseHeader, FlowchartPage
   EXPORTS: FlowchartPageWrapper (default)
   ============================================ */
import { useSearchParams } from 'react-router-dom';
import { useBrainStore } from '../../store/brainStore';
import FlowchartPage from '../FlowchartPage';
import LiveCaseHeader from './LiveCaseHeader';

// #region Component

/**
 * FlowchartPageWrapper — Layer A bridge.
 *
 * Route: /flow/:flowId?caseId=<caseId>
 *
 * - Without caseId → FlowchartPage (unchanged static guide)
 * - With valid caseId → LiveCaseHeader + FlowchartPage
 * - With invalid caseId → FlowchartPage (static fallback + console warning)
 */
export default function FlowchartPageWrapper() {
  const [searchParams] = useSearchParams();
  const caseId = searchParams.get('caseId');

  // ─── Resolve case from store (only if caseId present) ───
  const caseEntity = useBrainStore(s =>
    caseId ? s.cases.find(c => c.caseId === caseId) ?? null : null
  );

  // ─── Debug: invalid caseId ───
  if (caseId && !caseEntity) {
    console.warn(
      `[FlowchartPageWrapper] caseId="${caseId}" not found in brainStore. ` +
      `Falling back to static Guide Screen. ` +
      `Available cases: [${useBrainStore.getState().cases.map(c => c.caseId).join(', ')}]`
    );
  }

  return (
    <>
      {caseEntity && <LiveCaseHeader caseEntity={caseEntity} />}
      <FlowchartPage />
    </>
  );
}

// #endregion
