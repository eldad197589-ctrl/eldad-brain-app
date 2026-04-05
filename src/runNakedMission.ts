import { useBrainStore } from './store/brainStore';
import { getCaseContextTool, evaluateCaseReadinessTool, updateCaseDraftTool } from './services/agentToolDefinitionsCase';

async function mockAgentRun() {
  const store = useBrainStore.getState();
  store.resetToSeed();
  
  const caseId = 'dima-rodnitski';
  const c1 = store.cases.find(c => c.caseId === caseId);
  console.log("\n--- DRAFT DIFF (BEFORE) ---");
  console.log("Status:", c1?.draft?.status);
  console.log("Content Extract:", c1?.draft?.content.substring(0, 100).replace(/\n/g, ' '));
  console.log("Suggested Blocks Count:", Object.keys(c1?.draft?.suggestedBlocks || {}).length);
  
  console.log("\n--- MISSION TRACE (TOOL EXECUTION) ---");
  const ctx = await getCaseContextTool.execute({ case_id: caseId });
  console.log("Step 1 (Intake Phase): Called get_case_context. Success.");
  
  const eval1 = await evaluateCaseReadinessTool.execute({ case_id: caseId });
  console.log("Step 2 (Analysis Phase): Called evaluate_case_readiness. Status remains:", (eval1 as any).currentDraftStatus);

  // Agent decides to update the draft (simulated AI logic)
  const oldContent = (ctx as any).draft.content;
  const aiGeneratedContent = oldContent
    .replace('סכום הנזק הנתבע: לא צוין', 'סכום הנזק הנתבע: 85,000 ש"ח')
    .replace('[מקום להכנסת רקע החלטה]', 'רשות המסים דחתה בטעות בטענה שאין קשר סיבתי.');
    
  console.log("Step 3 (Document Phase): Calling update_case_draft with injected facts.");
  const updateRes = await updateCaseDraftTool.execute({
    case_id: caseId,
    patch: { content: aiGeneratedContent, blockNotes: "מילוי פלייס-הולדרים על סמך ניתוח ראיות." }
  });
  console.log("Update Tool Result:", (updateRes as any).success ? "Success" : "Failed");

  const eval2 = await evaluateCaseReadinessTool.execute({ case_id: caseId });
  console.log("Step 4 (Evaluate Phase again): Called evaluate_case_readiness.");

  console.log("\n--- STATUS RESULT & DRAFT DIFF (AFTER) ---");
  const c2 = useBrainStore.getState().cases.find(c => c.caseId === caseId);
  console.log("Final Status:", c2?.draft?.status);
  console.log("Content Extract (Modified):", c2?.draft?.content.substring(0, 100).replace(/\n/g, ' '));
  
  console.log("\n--- SAFETY CHECK ---");
  console.log("Did Eldad's blocks survive?", Object.keys(c2?.draft?.suggestedBlocks || {}).length === Object.keys(c1?.draft?.suggestedBlocks || {}).length ? 'YES' : 'NO');
  console.log("Did status surpass under_review?", c2?.draft?.status === 'ready_for_submission' ? 'NO (Blocked by Approval Gate)' : (c2?.draft?.status === 'under_review' ? 'YES (Safely gated at under_review)' : 'OTHER'));
}

mockAgentRun().catch(console.error);
