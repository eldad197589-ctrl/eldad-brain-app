/* ==== FILE: src/pages/internal/process-library/ProcessLibrarySurface.tsx ==== */

// #region Imports
import { AGENT_PROCESS_ASSIGNMENTS } from '../../../work-spine/agent-process-map/agent-process-assignment-seed';
import {
  PROCESS_LIBRARY_BLUEPRINTS,
  PROCESS_LIBRARY_BLUEPRINT_WARNING,
} from '../../../work-spine/process-library/process-library-seed';
// #endregion

// #region Constants
const SAFETY_WARNING = 'תצוגה בלבד — אין הפעלה, אין יצירת תיק, אין יצירת משימה, אין שמירה';

const FORBIDDEN_ACTION_LABELS: Record<string, string> = {
  execute_workflow: 'אין הפעלת תהליך',
  submit_output: 'אין הגשה',
  send_message: 'אין שליחה',
  file_document: 'אין תיוק',
  create_case_file: 'אין יצירת תיק',
  create_task_record: 'אין יצירת משימה',
  create_document_pointer: 'אין יצירת הפניית מסמך',
  persist_state: 'אין שמירה',
  provider_connection: 'אין חיבור ספק',
  read_source_content: 'אין קריאת תוכן מקור',
  run_ocr: 'אין OCR',
  agent_autonomy: 'אין אוטונומיית סוכן',
};
// #endregion

// #region Helpers
const assignmentFor = (processId: string) =>
  AGENT_PROCESS_ASSIGNMENTS.find((assignment) => assignment.processId === processId);

const formatList = (items: readonly string[]) => items.join(' · ');
// #endregion

// #region Types
/** Props for rendering one static process blueprint card. */
interface ProcessBlueprintCardProps {
  /** Static process blueprint from the Process Library seed. */
  process: (typeof PROCESS_LIBRARY_BLUEPRINTS)[number];
}
// #endregion

// #region Component
/** ProcessBlueprintCard — Renders one static process blueprint row with passive gates and agents. */
function ProcessBlueprintCard({ process }: ProcessBlueprintCardProps) {
  const assignment = assignmentFor(process.processId);
  const relatedAgents = assignment
    ? [...assignment.primaryAgentIds, ...assignment.supportingAgentIds, ...assignment.reviewAgentIds]
    : process.relatedAgents;

  return (
    <article
      data-testid="process-library-blueprint"
      style={{ background: 'rgba(15, 23, 42, 0.78)', border: '1px solid rgba(148, 163, 184, 0.24)', borderRadius: 8, padding: 16 }}
    >
      <header style={{ alignItems: 'baseline', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 22, margin: 0 }}>{process.hebrewName}</h2>
        <span style={{ color: '#93c5fd' }}>{process.domain}</span>
      </header>

      <dl style={{ display: 'grid', gap: 8, gridTemplateColumns: '160px 1fr', margin: '14px 0 0' }}>
        <dt>טריגר</dt>
        <dd>{process.trigger}</dd>
        <dt>שלבי עבודה</dt>
        <dd>{formatList(process.workflowStages)}</dd>
        <dt>סוכנים קשורים</dt>
        <dd>{formatList(relatedAgents)}</dd>
        <dt>שערים נדרשים</dt>
        <dd>{formatList([...(assignment ? [assignment.requiredGate] : []), ...process.requiredGates])}</dd>
        <dt>פעולות חסומות</dt>
        <dd>{formatList(process.forbiddenActions.map((action) => FORBIDDEN_ACTION_LABELS[action]))}</dd>
        <dt>operationalExecution</dt>
        <dd>false</dd>
      </dl>
    </article>
  );
}

/** ProcessLibrarySurface — Renders the static read-only professional Process Library. */
export default function ProcessLibrarySurface() {
  return (
    <main data-testid="process-library-surface" dir="rtl" style={{ color: '#e5edf7', padding: 24 }}>
      <section style={{ marginBottom: 20 }}>
        <p style={{ color: '#9fb1c7', margin: 0 }}>Stage 22B</p>
        <h1 style={{ fontSize: 34, margin: '6px 0 10px' }}>ספריית תהליכים</h1>
        <p role="note" style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(248, 113, 113, 0.45)', borderRadius: 8, margin: 0, padding: 12 }}>
          {SAFETY_WARNING}
        </p>
        <p style={{ color: '#9fb1c7', margin: '10px 0 0' }}>{PROCESS_LIBRARY_BLUEPRINT_WARNING}</p>
      </section>

      <section aria-label="רשימת תהליכים מקצועיים" style={{ display: 'grid', gap: 12 }}>
        {PROCESS_LIBRARY_BLUEPRINTS.map((process) => (
          <ProcessBlueprintCard key={process.processId} process={process} />
        ))}
      </section>
    </main>
  );
}
// #endregion
