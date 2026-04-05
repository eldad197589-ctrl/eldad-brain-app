import { useBrainStore } from './store/brainStore';
import { getCaseContextTool, evaluateCaseReadinessTool, updateCaseDraftTool, approveCaseDraftTool, generateCaseOutputTool } from './services/agentToolDefinitionsCase';

async function verifyApprovalFlow() {
  const store = useBrainStore.getState();
  store.resetToSeed();
  
  const caseId = 'dima-rodnitski';
  
  console.log("=== PHASE 1: REACHING 'UNDER_REVIEW' ===");
  // Force content to meet substantive threshold
  await updateCaseDraftTool.execute({
    case_id: caseId,
    patch: { content: 'This is a substantive body replacement to bypass the template check.', blockNotes: 'Updated via AI.' }
  });
  
  const eval1 = await evaluateCaseReadinessTool.execute({ case_id: caseId });
  const status1 = store.cases.find(c => c.caseId === caseId)?.draft?.status;
  console.log(`Status after update: ${status1}`);
  console.log(`Requires Eldad Approval? ${(eval1 as any).evaluation?.requiresEldadApproval ? 'YES' : 'NO'}`);

  console.log("\n=== PHASE 2: AGENT APPROVAL WITH AUDIT TRAIL ===");
  const approvalRes = await approveCaseDraftTool.execute({
    case_id: caseId,
    authorization_quote: "אלדד: מאשר את טיוטת הערר של דימה, תכינו להגשה."
  });
  
  const caseAfterApprove = store.cases.find(c => c.caseId === caseId);
  const status2 = caseAfterApprove?.draft?.status;
  console.log(`Approval Tool Result: ${(approvalRes as any).success ? 'Success' : 'Failed'}`);
  console.log(`Status after explicit approval: ${status2}`);
  console.log(`Audit Trail in Sufficiency Warning: \n${caseAfterApprove?.draft?.sufficiencyWarning}`);

  console.log("\n=== PHASE 3: FINAL_WORD (GENERATION) ===");
  // Note: we just console log the expectation since generateCaseOutputTool uses browser API which crashes node.
  if (status2 === 'ready_for_submission') {
    console.log(`Status is ready_for_submission. The generateCaseOutputTool can now be safely invoked by output agents.`);
  } else {
    console.log(`Status is ${status2}. Generate tool is blocked.`);
  }
}

verifyApprovalFlow().catch(console.error);
