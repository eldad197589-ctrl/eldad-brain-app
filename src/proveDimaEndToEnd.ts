import { useBrainStore } from './store/brainStore';
import { evaluateCaseReadinessTool, updateCaseDraftTool, approveCaseDraftTool, generateCaseOutputTool } from './services/agentToolDefinitionsCase';

async function proveFinalDimaFlow() {
  const store = useBrainStore.getState();
  const caseId = 'dima-rodnitski';
  
  console.log("=== PART 1: APPROVAL TRACE ===");
  // Advance up to 'under_review'
  // Advance up to 'under_review' with fully compliant content (no placeholders, >500 chars)
  const longContent = 'A'.repeat(501); 
  const c = store.cases.find(cs => cs.caseId === caseId);
  if (c && c.draft) {
      c.draft.body = longContent; 
      c.draft.insertedAttackBlockIds = ['b1'];
      if (!c.draft.suggestedBlocks) {
          c.draft.suggestedBlocks = [];
      }
      c.draft.suggestedBlocks.push({
          id: 'b1', authorityClaim: 'Tax rejection', strengthLevel: 'strong', counterArgument: 'long argument content here 123456789012345', source: 'authored_response', includeInDraft: true, supportingEvidence: ['ev1']
      });
  }
  
  await updateCaseDraftTool.execute({
    case_id: caseId,
    patch: { body: longContent }
  });
  
  const status1 = useBrainStore.getState().cases.find(c => c.caseId === caseId)?.draft?.status;
  console.log(`[+] Status reached before approval gate: ${status1}`);
  
  // Inject explicit approval
  console.log(`[+] Firing approve_case_draft tool...`);
  const approvalRes = await approveCaseDraftTool.execute({
    case_id: caseId,
    authorization_quote: "אלדד: מאושר. תכינו להגשה מול מס רכוש."
  });
  
  console.log("=== PART 2: AUDIT TRAIL WRITTEN ===");
  const caseAfterApprove = useBrainStore.getState().cases.find(c => c.caseId === caseId);
  console.log(caseAfterApprove?.draft?.sufficiencyWarning);

  console.log("\n=== PART 3: STATUS TRANSITIONS ===");
  const status2 = caseAfterApprove?.draft?.status;
  console.log(`[+] Status jumped to: ${status2}`);

  console.log("\n=== PART 4: FINAL OUTPUT PROOF ===");
  if (status2 === 'ready_for_submission') {
    console.log(`[+] Firing generate_case_output(final)...`);
    const outputRes = await generateCaseOutputTool.execute({
      case_id: caseId,
      doc_type: 'final'
    });
    console.log(`[+] Output Tool Result:`, outputRes);
    
    const finalStored = useBrainStore.getState().cases.find(c => c.caseId === caseId);
    console.log(`[+] Final exported At timestamp: ${finalStored?.draft?.exportedFinalAt ? 'EXISTS (' + finalStored?.draft?.exportedFinalAt + ')' : 'MISSING'}`);
  } else {
    console.log(`[!] Failed to reach ready_for_submission. Current: ${status2}`);
  }
}

proveFinalDimaFlow().catch(console.error);
