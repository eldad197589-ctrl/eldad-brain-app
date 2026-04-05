import { useBrainStore } from './store/brainStore';
import { getCaseContextTool, evaluateCaseReadinessTool, updateCaseDraftTool } from './services/agentToolDefinitionsCase';
import { planCaseMission } from './services/caseMissionPlanner';

async function run() {
  console.log("=== 1. Initial State ===");
  useBrainStore.getState().resetToSeed(); // Ensure clean seed
  const c1 = useBrainStore.getState().cases.find(c => c.caseId === 'dima-rodnitski');
  console.log(`Case: ${c1?.caseId}, Status: ${c1?.status}, Draft Status: ${c1?.draft?.status}`);

  console.log("\n=== 2. Create Mission ===");
  const mission = planCaseMission('dima-rodnitski');
  console.log("Mission Steps:", JSON.stringify((mission as any).steps, null, 2));

  console.log("\n=== 3. Execute Tool: get_case_context ===");
  const ctx = await getCaseContextTool.execute({ case_id: 'dima-rodnitski' });
  console.log(`Extracted keys: ${Object.keys(ctx).join(', ')}`);
  console.log(`Draft details: ${JSON.stringify((ctx as any).draft)}`);

  console.log("\n=== 4. Execute Tool: evaluate_case_readiness ===");
  const evalRes = await evaluateCaseReadinessTool.execute({ case_id: 'dima-rodnitski' });
  console.log("Evaluation details:", JSON.stringify((evalRes as any).evaluation, null, 2));
  console.log("Current Draft Status:", (evalRes as any).currentDraftStatus);
  console.log("Status Advanced?:", (evalRes as any).statusAdvanced);
}

run().catch(console.error);
