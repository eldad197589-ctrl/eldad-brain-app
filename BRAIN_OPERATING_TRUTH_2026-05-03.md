# Brain Operating Truth - 2026-05-03

This document is the current read-only operating truth for Eldad's Brain.
It is a governance checkpoint only. It does not approve implementation, persistence,
promotion, live connectors, file movement, or operational record creation.

## 1. Current Verified Checkpoint

- Current confirmed safe stage commits:
  - `2408d7a` - Add VAT static learning seed candidates.
  - `74d4025` - Add unified intake source model contracts.
  - `2e12d92` - Add unified intake source preview UI.
  - `5745493` - Add Gmail metadata unified intake source mapping.
  - `c7392f5` - Add Drive metadata unified intake source mapping.
  - `bc5e407` - Add scans metadata unified intake source mapping.
  - `49b4ba9` - Add metadata provider adapter registry.
  - `b087369` - Add unified provider metadata preview UI.
  - `4882b82` - Add scans manifest preview UI.
  - `a94e73b` - Add protocol intake source type.
- Verified runtime-safe internal layers:
  - `/internal/unified-intake`
  - `/internal/scanned-intake`
  - `/internal/brain-diagnostics`
  - `/internal/learning-inbox`
- Latest known statuses:
  - `WORKING_BRAIN_SAFE_RUNTIME_CHECKPOINT_READY`
  - `UNIFIED_INTAKE_LOCAL_PIPELINE_CLOSED`
  - `LEARNING_INBOX_RUNTIME_VERIFIED`
  - `KNOWLEDGE_INVENTORY_AUDIT_READY`
  - `LEARNING_TAXONOMY_REFACTOR_COMMITTED`
  - `CODEX_STATE_SYNC_READY`
  - `STAGE5E_UNIFIED_PROVIDER_PREVIEW_COMMITTED`
  - `STAGE6C2_SCANS_MANIFEST_PREVIEW_COMMITTED`
  - `STAGE6D0_PROTOCOL_SOURCE_TYPE_COMMITTED`

## Completed Stages 2-4 - 2026-05-03

### Stage 2 Completed - VAT Static LearningCandidate Seeds

- Commit: `2408d7a` - Add VAT static learning seed candidates.
- VAT static LearningCandidate seeds are committed.
- Approved static seed records:
  - `learning-insight-2026-04-21-vat-ingestion-vs-claiming`
  - `learning-insight-2026-04-28-google-play-vat-treatment`
- Candidate status remains `pending_eldad_review`.
- `approvedByEldad=false`.
- `bindingUse=none`.
- These records are metadata-only static seeds.
- No full insight markdown body was imported.
- No `brainStore`, Supabase, RAG, KnowledgeSearch, or persistence connection was added.
- These records are not approved knowledge and must not be treated as binding.

### Stage 3 Completed - Unified Intake Source Model Contracts

- Commit: `74d4025` - Add unified intake source model contracts.
- Static Unified Intake source model contracts are committed under `src/work-spine/intake`.
- Six static source types are modeled:
  - `email`
  - `drive`
  - `scan`
  - `manual_upload`
  - `manual_text`
  - `unknown`
- Boundary flags are locked:
  - `allowedMode=local_preview_only`
  - `canCreateWorkItem=false`
  - `canCreateMatter=false`
  - `canCreateDocumentRef=false`
  - `requiresEldadApproval=true`
  - `operationalActionBlocked=true`
- Stage 3 is type/seed/test/config only.
- It does not connect to Work Spine runtime, repositories, use-cases, stores, or mutation paths.

### Stage 4 Completed - Unified Intake Source Preview UI

- Commit: `2e12d92` - Add unified intake source preview UI.
- `/internal/unified-intake` displays the six Stage 3 source mocks as a read-only preview.
- The preview is static only.
- No real provider is connected.
- No operational action can be created from this preview.
- The preview has no action buttons, no operational `onClick` handlers, no store usage, and no API calls.
- The preview imports only the static Unified Intake source seed.
- This is a visual inspection layer only, not an intake engine.

### Stage 5A Completed - Gmail Metadata Unified Intake Mapping

- Commit: `5745493` - Add Gmail metadata unified intake source mapping.
- Stage 5A reconciles safe Gmail read-only metadata with the committed `UnifiedIntakeSource` model.
- The mapping is metadata-only.
- It uses a static Gmail metadata mock only.
- It maps Gmail metadata into `sourceType=email`.
- Gmail remains provider metadata only.
- Boundary flags remain locked:
  - `allowedMode=local_preview_only`
  - `canCreateWorkItem=false`
  - `canCreateMatter=false`
  - `canCreateDocumentRef=false`
  - `requiresEldadApproval=true`
  - `operationalActionBlocked=true`
- Stage 5A does not include:
  - live Gmail API
  - OAuth or token logic
  - full email body reading
  - raw MIME reading
  - attachment content reading
  - `googleapis`
  - `fetch`
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation

### Stage 5B Completed - Drive Metadata Unified Intake Mapping

- Commit: `c7392f5` - Add Drive metadata unified intake source mapping.
- Stage 5B reconciles safe Google Drive file metadata with the committed `UnifiedIntakeSource` model.
- The mapping is metadata-only.
- It maps Drive metadata into `sourceType=drive`.
- Provider is `google_drive` only inside Drive-specific metadata.
- It uses static Drive metadata mocks only.
- Static mocks include file metadata examples only:
  - PDF file metadata with `sizeBytes`.
  - Google Sheet metadata without file content and without `sizeBytes`.
  - Hebrew filename PDF metadata.
- Stage 5B does not include:
  - folders or folder mocks
  - folder traversal
  - live Drive API
  - OAuth or token logic
  - file content reading
  - Google Docs, Sheets, or Slides body/content reading
  - downloads or exports
  - thumbnails
  - OCR
  - base64
  - buffers or raw bytes
  - `googleapis`
  - `fetch`
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation

### Stage 5C Completed - Scans Metadata Unified Intake Mapping

- Commit: `bc5e407` - Add scans metadata unified intake source mapping.
- Stage 5C reconciles safe scan manifest metadata with the committed `UnifiedIntakeSource` model.
- The mapping is metadata-only.
- It maps scan metadata into `sourceType=scan`.
- Provider exists only inside `ScanFileMetadata`.
- It uses static scan metadata mocks only.
- Static mocks include synthetic scan metadata examples only:
  - single-page PDF invoice scan metadata.
  - multi-page PDF document scan metadata.
  - unknown or low-quality scan metadata.
- Stage 5C does not include:
  - OCR
  - `fs` or `path`
  - physical file reads
  - `fs.readdir`, `fs.readFile`, or `fs.stat`
  - scanner drivers
  - PDF or image parsing
  - real local file paths
  - file movement, deletion, or rename
  - `/internal/scanned-intake` UI wiring
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation

### Stage 5D Completed - Provider-Agnostic Metadata Adapter Boundary

- Commit: `49b4ba9` - Add metadata provider adapter registry.
- Stage 5D adds a provider-agnostic metadata adapter boundary for committed metadata-only provider mappers.
- The static registry includes exactly:
  - Gmail metadata adapter.
  - Drive metadata adapter.
  - Scans metadata adapter.
- All adapters return `UnifiedIntakeSource` only.
- Adapter mode is `metadata_only`.
- All adapter capabilities are explicit false:
  - `liveConnection=false`
  - `oauth=false`
  - `apiAccess=false`
  - `fileSystemAccess=false`
  - `contentRead=false`
  - `createsOperationalRecords=false`
  - `persists=false`
- Normalized source types remain:
  - Gmail -> `email`
  - Drive -> `drive`
  - Scans -> `scan`
- Stage 5D does not include:
  - live provider connection
  - API access
  - OAuth or token behavior
  - filesystem access
  - UI wiring
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation
- Stage 5D adapters do not expose operational methods:
  - `connect`
  - `sync`
  - `fetch`
  - `read`
  - `authorize`
  - `store`
  - `create`
  - `promote`
  - `move`
  - `delete`
  - `download`
  - `export`

### Stage 5E Completed - Unified Provider Preview UI

- Commit: `b087369` - Add unified provider metadata preview UI.
- `/internal/unified-intake` displays Gmail, Drive, and Scans together as one unified read-only provider preview.
- The preview consumes the committed Stage 5D `METADATA_ADAPTER_REGISTRY`.
- No parallel provider registry was created.
- The preview is read-only and metadata-only.
- The preview displays:
  - adapter identity
  - provider kind
  - normalized source type
  - display name
  - `mode=metadata_only`
  - source metadata summaries only
  - locked boundary flags
  - adapter capabilities, all false
- Stage 5E does not include:
  - live provider connection
  - OAuth, API, token, Local Vault, or credential behavior
  - filesystem access
  - OCR
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation
  - action buttons
  - operational `onClick` handlers

### Stage 5 Overall Completed - Metadata-Only Provider Preview Layer

- Stage 5A Gmail metadata mapping is completed.
- Stage 5B Drive metadata mapping is completed.
- Stage 5C Scans metadata mapping is completed.
- Stage 5D provider-agnostic metadata adapter registry is completed.
- Stage 5E unified provider preview is completed.
- All Stage 5 work remains:
  - metadata-only
  - static or read-only preview
  - `local_preview_only`
  - non-operational
  - disconnected from live providers
  - disconnected from store and persistence
  - unable to create WorkItem, Matter, or DocumentRef records

### Test Infrastructure Audit - 2026-05-03

- Status: `TEST_INFRA_AUDIT_READY`.
- Direct targeted Vitest can fall back to `vite.config.ts` because no root `vitest.config.*` currently exists.
- The root Vite config is app runtime configuration, not a dedicated test configuration.
- Focused `vitest.<domain>.config.mjs` files are the current approved workaround for isolated tests.
- Future cleanup may address package, Vite, and Vitest configuration boundaries.
- That cleanup is not approved now and must not be mixed into static intake or provider commits.

### Stage 7 Planning Result - Approval Gate

- Status: `STAGE7_APPROVAL_GATE_PLAN_READY`.
- Approval Gate planning is ready.
- Approval means Eldad reviewed a metadata-only source and allows it to proceed later.
- Approval is not an operational action.
- Approval does not create:
  - WorkItem
  - Matter
  - DocumentRef
  - persistence records
  - routing actions
  - provider actions
- First implementation should be static/mock approval contract and tests only.

### Candidate Lifecycle Planning Result

- Status: `CANDIDATE_LIFECYCLE_PLAN_READY`.
- CandidatePreview planning is ready.
- Candidate preview types:
  - Filing Candidate
  - Task Candidate
  - Process Candidate
  - Case Evidence Candidate
  - Learning Candidate
  - Unknown Candidate
- Candidate previews are not operational records.
- One metadata source may produce multiple candidate previews.
- No WorkItem, Matter, DocumentRef, store write, or persistence behavior is approved until a later explicit gate.

### Stage 6C-1 Completed - Scans Manifest Static Contract

- Commit: `1b39f01` - Add static scans manifest contracts.
- Scans Manifest static contract is committed.
- Stage 6C-1 is static TypeScript manifest contracts/tests only.
- Manifest source type is `sourceType=scan`.
- The committed work includes:
  - static manifest contracts
  - static manifest fixture
  - pure mapping from manifest entries to existing `ScanFileMetadata`
  - pure mapping onward to `UnifiedIntakeSource`
  - focused tests and focused Vitest config
- Stage 6C-1 does not include:
  - manifest file loader
  - JSON or CSV reading
  - `fs` or `path`
  - OCR
  - PDF or image parsing
  - scanner driver integration
  - physical file reads
  - file movement, deletion, or rename
  - `/internal/scanned-intake` UI wiring
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation

### Stage 6C-2 Completed - Scans Manifest Preview UI

- Commit: `4882b82` - Add scans manifest preview UI.
- `/internal/scanned-intake` displays `STATIC_SCAN_MANIFEST` entries as a read-only/static preview.
- The preview displays manifest metadata:
  - `manifestId`
  - `schemaVersion`
  - `generatedAt`
  - `sourceType=scan`
- The preview displays static manifest entry metadata:
  - `scanId`
  - `filename`
  - `scannerIdentity`
  - `timestamp`
  - `fileType`
  - optional `pageCount`
  - optional `fileSizeBytes`
  - optional `confidenceLabel`
- Stage 6C-2 does not include:
  - manifest loader
  - JSON or CSV reading
  - `fs` or `path`
  - OCR
  - PDF or image parsing
  - scanner driver integration
  - physical file reads
  - file movement, deletion, or rename
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation
  - action buttons
  - operational `onClick` handlers

### Stage 6C Current Boundary

- Stage 6C-1 static manifest contract is completed.
- Stage 6C-2 static manifest preview UI is completed.
- Stage 6C-3 read-only manifest loader remains blocked.
- Stage 6C-3 requires a separate Agent A gate before any implementation.
- Until that gate exists, no manifest loader, JSON/CSV reader, filesystem access, OCR, parser, scanner driver, file operation, persistence, store write, or operational record creation is allowed.

### Future Stage 6D Source Channel - Robium Protocol / Meeting Protocol Intake

- Stage 6D may be planned later as a Robium Protocol / Meeting Protocol Intake source channel.
- Protocol means calls, meetings, or Robium protocol/transcription material that may later produce candidate previews.
- Protocol intake must be treated as read-only until a separate Agent A gate.
- Protocol material may later produce:
  - Task Candidate
  - Process Candidate
  - Filing Candidate
  - Learning Candidate
  - Calendar/Journal Candidate
  - Unknown Candidate
- Protocol intake does not create real tasks, calendar items, workflows, filings, learning entries, or operational records.
- No real task, calendar, workflow, routing, persistence, or provider action is allowed without Stage 7 Approval Gate and later operational gates.

### Stage 6D-0 Completed - Protocol SourceType Contract Extension

- Commit: `a94e73b` - Add protocol intake source type.
- Stage 6D-0 is an additive Unified Intake source contract expansion only.
- `IntakeSourceType` now includes exactly:
  - `email`
  - `drive`
  - `scan`
  - `manual_upload`
  - `manual_text`
  - `unknown`
  - `protocol`
- Stage 6D-0 does not include:
  - protocol metadata types
  - protocol mocks
  - protocol mapper
  - provider adapter registry changes
  - UI
  - live Protokol or Robium API
  - transcript content ingestion
  - extracted task, calendar, decision, or workflow records
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation

### Stage 6D-1 Completed - Protocol Metadata Mapping

- Commit: `e0cfb1f` - Add protocol metadata unified intake source mapping.
- Protocol metadata mapping is completed and committed.
- Protocol metadata is metadata-only.
- Unified source output uses `sourceType='protocol'`.
- `provider='robium_protokol'` remains only inside `ProtocolRecordMetadata`.
- Static protocol mocks only.
- Stage 6D-1 does not include:
  - transcript text
  - full transcript
  - raw audio or video
  - extracted tasks
  - extracted decisions
  - action items
  - task, calendar, or workflow creation
  - live Protokol or Robium API
  - webhook
  - adapter registry changes
  - UI changes
  - runtime provider connection
  - store or persistence usage
  - WorkItem, Matter, or DocumentRef creation

### Stage 6 Status

- Metadata intake foundation now covers Gmail, Drive, Scans, and Protocol.
- Gmail metadata mapping remains metadata-only and not a live Gmail connector.
- Drive metadata mapping remains metadata-only and not a live Drive connector.
- Scans metadata mapping remains metadata-only and not OCR/filesystem/scanner integration.
- Protocol metadata mapping remains metadata-only and not a live Protokol or Robium integration.
- Scans have static manifest contract and static preview UI.
- Live provider connections remain blocked until separate gates.
- Scans manifest loader remains blocked until a separate 6C-3 gate.

### Stage 7A Completed - Approval Gate Static Decision Contract

- Commit: `7033098` - Add approval gate static decision contract.
- Stage 7A Approval Gate static decision contract is completed and committed.
- `approvalScope='metadata_preview_only'`.
- Allowed statuses:
  - `pending_review`
  - `approved_for_candidate_preview`
  - `rejected`
  - `needs_more_evidence`
  - `blocked`
- `approved_for_candidate_preview` allows only later CandidatePreview generation.
- Approval does not permit:
  - WorkItem creation
  - Matter creation
  - DocumentRef creation
  - persistence
  - routing
  - provider action
  - task creation
  - calendar item creation
  - workflow item creation
  - real operational state
- Stage 7A does not include:
  - UI
  - real approval ledger
  - store or persistence usage
  - `localStorage`, Supabase, or DB usage
  - provider, API, OAuth, filesystem, or OCR behavior
  - operational creation

### Stage 7B Completed - Approval Gate Preview UI

- Commit: `b97b002` - Add approval gate preview UI.
- Route added: `/internal/approval-gate-preview`.
- Stage 7B Approval Gate Preview UI is completed and committed.
- The route is a dedicated read-only internal route.
- It consumes only Stage 7A static `ApprovalDecision` fixtures.
- It shows `approvalScope='metadata_preview_only'`.
- It displays:
  - approval statuses
  - safety flags
  - blocked operational effects
  - `allowedNextStep`
- Stage 7B includes no approval interaction.
- Stage 7B includes no approve, reject, defer, or block buttons.
- Stage 7B includes no `onClick` handlers.
- Stage 7B includes no:
  - store usage
  - persistence
  - `localStorage`
  - Supabase
  - DB
  - WorkItem creation
  - Matter creation
  - DocumentRef creation
  - provider connection
  - API
  - OAuth
  - filesystem behavior
  - OCR
  - operational creation

### Stage 7C Completed - Local Ephemeral Approval Interaction

- Commit: `a9f0282` - Add local approval gate simulation.
- `/internal/approval-gate-preview` now supports local simulation only.
- Local simulation actions:
  - Approve -> `approved_for_candidate_preview`
  - Reject -> `rejected`
  - Needs More Evidence -> `needs_more_evidence`
  - Blocked -> `blocked`
  - Reset -> original fixture state
- Permanent banner:
  - `⚠️ סימולציה בלבד — שום פעולה לא נשמרת`
- A `[SIMULATED]` badge appears after local state changes.
- Stage 7C includes no:
  - persistence
  - `localStorage` or `sessionStorage`
  - store usage
  - Supabase or DB usage
  - provider connection
  - API
  - OAuth
  - filesystem behavior
  - OCR
  - WorkItem creation
  - Matter creation
  - DocumentRef creation
  - task creation
  - calendar item creation
  - workflow item creation
  - approval ledger or audit trail
  - CandidatePreview creation

### Stage 7 Current Status

- Stage 7A static contract is complete.
- Stage 7B read-only preview is complete.
- Stage 7C local ephemeral simulation is complete.
- Stage 7 is complete only at the internal/static/local simulation level.
- Stage 7 does not create operational records.
- Stage 7 does not create durable approval state.

### Stage 8 Completed - Operational Object Preview Contracts

- Commit: `a077533` - Add operational object preview contracts.
- Stage 8 Operational Object Preview contracts are completed and committed.
- Added preview-only contracts:
  - `WorkItemPreview`
  - `MatterLinkPreview`
  - `DocumentRefPreview`
  - `OperationalPreviewBundle`
- All individual preview objects are hypothetical only.
- All bundles are `preview_only`.
- Stage 8 locks:
  - `canExecute=false`
  - `canPersist=false`
  - `requiresEldadApproval=true`
  - `creationBlocked=true`
  - `creationBlockedReason='preview_only_no_persistence'`

### Stage 8 Boundary

- Stage 8 includes no:
  - real WorkItem creation
  - real Matter creation or linking
  - real DocumentRef creation
  - store usage
  - persistence
  - `localStorage`
  - Supabase
  - DB
  - Dashboard integration
  - CEO Bureau integration
  - client folder mutation
  - source folder mutation
  - output folder mutation
  - provider connection
  - API
  - OAuth
  - filesystem behavior
  - OCR
  - UI
  - action execution

### Stage 9 Completed - Real Actions Policy Map

- Commit: `27bbb8b` - Add real actions policy map.
- Stage 9 Real Actions Policy Map is completed and committed.
- Stage 9 is a static policy/governance layer only.
- 13 future real-action policies are defined.
- Every policy has `status='blocked'`.
- Every policy has `implementationBlocked=true`.
- Risk levels 0-4 are defined:
  - `none`
  - `low`
  - `medium`
  - `high`
  - `critical`
- Manual-only actions:
  - `generate_client_letter`
  - `submit_vat_report`
  - `submit_tax_filing`
  - `send_email_reply`
  - `delete_file`

### Stage 9 Boundary

- Real actions remain blocked.
- Any future real action requires:
  - separate Agent A gate
  - Eldad approval according to risk level
- Stage 9 includes no:
  - executors
  - `async` or `await`
  - provider calls
  - file operations
  - store usage
  - persistence
  - WorkItem creation
  - Matter creation
  - DocumentRef creation
  - output generation
  - Dashboard integration
  - CEO Bureau integration
  - client folder mutation
  - source folder mutation
  - output folder mutation

### Stage 10 Completed - Professional Output Preview Contracts

- Commit: `e7c255b` - Add professional output preview contracts.
- Stage 10 Professional Output Preview Contracts is completed and committed.
- Stage 10 defines static professional output preview contracts, registry, fixtures, and tests only.
- Output types:
  - `letter`
  - `task_summary`
  - `scan_intake_report`
  - `protocol_action_summary`
  - `vat_review_memo`
  - `evidence_summary`
  - `professional_opinion_draft`
- Only preview statuses are allowed:
  - `preview_draft`
  - `structural_placeholder`
- Stage 10 has no `final`, `sent`, `filed`, `signed`, or `delivered` output statuses.
- Every preview has provenance:
  - `sourceIntakeId`
  - `sourceApprovalId`
  - `sourceOperationalPreviewId`
  - `policyActionRef`
- High-risk outputs require Eldad review.
- `professional_opinion_draft` is `critical`, `manualOnly`, and `neverAutoGenerate`.
- Every preview has `generationBlocked=true`.

### Stage 10 Boundary

- Stage 10 includes no:
  - DOCX generation
  - PDF generation
  - Excel generation
  - HTML generation
  - file writes
  - template execution
  - export
  - client-facing final output
  - store usage
  - persistence
  - WorkItem creation
  - Matter creation
  - DocumentRef creation
  - provider connection
  - API
  - OAuth
  - filesystem behavior
  - OCR
  - Dashboard integration
  - CEO Bureau integration
  - client folder mutation
  - source folder mutation
  - output folder mutation

### Stage 11 Completed - Professional Workflow Map Contracts

- Commit: `52198f4` - Add static professional workflow maps.
- Stage 11 Static Professional Workflow Maps is completed and committed.
- Stage 11 defines static/descriptive professional workflow maps only.
- Domains:
  - `protocol_task_management`
  - `client_case_filing`
  - `bookkeeping`
  - `vat`
  - `payroll`
  - `war_compensation`
  - `labor_law`
  - `expert_opinions`
- Stage 11 has no workflow execution.
- Stage 11 has no Dashboard, CEO Bureau, Brain Router, or Settings integration.
- Stage 11 has no Stage 10 typed imports; output references are ID strings only.
- Stage 11 capabilities are all false.

### Stage 11 Boundary

- Stage 11 includes no:
  - execution
  - runtime workflow engine
  - provider connection
  - store usage
  - persistence
  - WorkItem creation
  - Matter creation
  - DocumentRef creation
  - dashboard wiring
  - CEO Bureau wiring
  - Brain Router wiring
  - Settings wiring
  - file generation
  - client folder mutation
  - source folder mutation
  - output folder mutation

### Stage 12 Completed - QC and Eldad Approval Preview Contracts

- Commit: `b48d92e` - Add static QC preview contracts.
- Stage 12 Static QC and Eldad Approval Preview Contracts is completed and committed.
- Stage 12 is QC preview only.
- Stage 12 defines preview subjects, checklists, findings, blocking issues, approval requirements, approval decision previews, review contexts, policy coverage maps, and QC preview results.
- Stage 12 has no QC ledger.
- Stage 12 has no persisted approval.
- Stage 12 has no final approval state.
- Stage 12 approval decisions are `previewOnly`.
- Stage 12 locks:
  - `canFinalizeOutput=false`
  - `canExecuteAction=false`
  - `canPersistDecision=false`

### Stage 12 Boundary

- Stage 12 includes no:
  - QC ledger
  - persisted approval
  - final approval state
  - store usage
  - persistence
  - `localStorage`
  - Supabase
  - DB
  - provider connection
  - API
  - OAuth
  - filesystem behavior
  - OCR
  - WorkItem creation
  - Matter creation
  - DocumentRef creation
  - dashboard wiring
  - CEO Bureau wiring
  - Brain Router wiring
  - Settings wiring

### Current Overall Milestone

- Stages 6-12 are completed at the safe contract/preview/mock level.
- Real actions remain blocked.
- No live providers are connected.
- No persistence exists for these stages.
- No file writes are allowed by these stages.
- No operational object creation is allowed by these stages.

### Current Safe Next Stage

- Immediate next safe stage:
  - Stage 13 Filing / Archive / Evidence Spine static contracts.
- Stage 13 must start as metadata-only Evidence Spine contracts/policies/tests.
- Stage 13 must include no:
  - file movement
  - folder creation
  - official folder mutation
  - DocumentRef creation
  - Matter creation
  - WorkItem creation
  - persistence
- Later safe options after separate approval:
  - Stage 6D Protocol Intake planning gate beyond metadata-only types/mocks/tests.
- Stage 6C-3 may later add a read-only manifest loader only after a separate Agent A gate.
- Hard boundary:
  - No live providers.
  - No operational object creation.
  - No persistence or store writes.
  - Static TS manifest contracts/tests only.
  - No manifest file loader.
  - No JSON or CSV reading.
  - No `fs` or `path`.
  - No OAuth, API, token, filesystem access, OCR, or provider runtime execution.
  - No PDF or image parsing.
  - No scanner driver.
  - No WorkItem, Matter, or DocumentRef creation.
  - No file movement, deletion, rename, download, export, upload, or mutation.
  - No `/internal/scanned-intake` UI wiring.

## Internal Screens Inventory - 2026-05-03

Status: `INTERNAL_SCREENS_INVENTORY_READY`.

### All `/internal` Routes

- `/internal/unified-intake` - `SAFE_STATIC`
  - Static/mock Unified Intake candidate and evidence preview.
  - Mock Email / Drive.
  - Universal Routing Suggestions.
  - Routing Approval Gate mock.
  - Local review and preview only.
- `/internal/scanned-intake` - `SAFE_STATIC`
  - Static Scan Manifest.
  - Manual Scan Review local state.
  - Blocked Preview Only.
- `/internal/learning-inbox` - `SAFE_STATIC`
  - Static/read-only Learning Inbox.
  - Static seed/type display only.
- `/internal/brain-diagnostics` - `READ_ONLY_DIAGNOSTIC`
  - Read-only diagnostic screen.
  - Reads Brain Spine projection snapshot and static folder-reality manifest.
- `/internal/brain-spine-monitor` - `READ_ONLY_DIAGNOSTIC`
  - Read-only Brain Spine monitor.
  - Refresh re-reads projection snapshot only.
- `/internal/orphan-intake-inspector` - `READ_ONLY_DIAGNOSTIC`
  - Read-only orphan/failure inspector.
  - Refresh re-runs inspection snapshot only.

Internal routes are hidden from sidebar/navigation unless explicitly linked later.

### Hidden/Internal Modules

- `MockEmailDriveUnifiedIntakeSection`
- `UniversalRoutingSuggestionSection`
- `UniversalRoutingApprovalGate`
- `UnifiedIntakeLocalReview`
- `ManualScanReview`
- `ScannedIntakeStaticManifestSection`
- `LocalDraftEditor`
- `BrainSpineHealthBadge`
- `BrainSpineMonitor`

These modules must remain local/static/read-only unless a separate gate approves a new behavior.

### Dangerous Or Gated Areas

- `/ceo` - `LIVE_MUTATION_CAPABLE`
  - CEO Bureau includes store setters, task/meeting mutation paths, WorkItem paths, RAG/Gemini paths, and localStorage paths.
- `/matter/:matterId` - `LIVE_MUTATION_CAPABLE`
  - Matter Workspace reads Matter store, local vault/indexed document refs, and includes reconciliation/apply controls.
- `/accounting-core` - `LIVE_MUTATION_CAPABLE`
  - Accounting Core runtime uses repositories, use-cases, audit traces, and workflow execution paths.
- `/settings` - `FROZEN`
  - UI is frozen, but the page still imports Gmail/Drive/local-vault services and integration stores.
- `/flow/:flowId` and `/flow/brain-router` - `PARTIALLY_LIVE`
  - Flowchart data is mostly static, but `FlowchartPageWrapper` imports `useBrainStore` for optional live case header behavior.
- `/` dashboard - `PARTIALLY_LIVE`
  - Dashboard uses Brain store data and Work Spine repository paths.

### Explicit Internal Screen Warnings

- Brain Diagnostics, Brain Spine Monitor, and Orphan Inspector are read-only but read live store snapshots.
- All pages under `Layout` inherit a store-connected shell.
- `/flow/brain-router` is visible and partially live, not safe-static.
- Internal routes are hidden from sidebar/navigation.
- `BrainLearnedBlock` can add knowledge through `brainStore`.
- `KnowledgeSearch` uses RAG/Gemini service paths.
- `TodayControlBoard` can create, transition, and update WorkItems.

### Safe Future Work Boundary

- Safe static work after approval:
  - `/internal/unified-intake`
  - `/internal/scanned-intake`
  - `/internal/learning-inbox`
  - static seed/type/test files
- Diagnostic internal screens may be audited read-only only:
  - `/internal/brain-diagnostics`
  - `/internal/brain-spine-monitor`
  - `/internal/orphan-intake-inspector`
- Do not convert diagnostic read access into repair, sync, promotion, persistence, or creation behavior without a separate gate.

## 2. Truly Local / Mock / Static

The following internal routes are currently treated as static, mock, local-only, or
read-only surfaces:

- `/internal/unified-intake`
  - Unified Intake candidate and evidence preview.
  - Mock Email / Drive preview.
  - Static Unified Intake Source Preview for six source mocks.
  - Universal Routing Suggestions.
  - Routing Approval Gate mock.
  - Local preview only.
  - No real WorkItem, Matter, or DocumentRef creation.
- `/internal/scanned-intake`
  - Static Scan Manifest.
  - Manual Scan Review local state.
  - Blocked Preview Only.
  - No live filesystem scan, OCR, file mutation, or promotion.
- `/internal/brain-diagnostics`
  - Read-only Brain diagnostics.
  - Static folder-reality manifest.
  - No sync, promote, persist, or operational record creation.
- `/internal/learning-inbox`
  - Static/read-only/mock Learning Inbox.
  - Uses committed Learning types/static seed only.
  - No approve, reject, persist, sync, or knowledgeLog update actions.

## 3. Partially Live / Store-Connected

The following app areas must not be treated as fully sandboxed:

- Main Brain dashboard.
- CEO Bureau / לשכת מנכ"ל.
- Brain Router / נתב המוח.
- Settings integrations screen.

Known facts:

- `src/main.tsx` imports `useBrainStore` and calls `initializeFromSupabase()`.
- The main dashboard uses store-connected paths and repository-connected paths.
- CEO Bureau includes mutation-capable paths.
- Brain Router reads from the Brain store.
- Settings imports live Gmail, Drive, and local vault services, but the UI is frozen.
- Gemini display is configuration visibility only, not a live connection check.

## 4. Frozen

These areas remain frozen unless explicitly approved in a later gate:

- `brainStore` and existing `knowledgeLog`.
- `BrainLearnedBlock`.
- `KnowledgeSearch`.
- Zustand-connected learning or knowledge paths.
- Supabase, RAG, persistence, and database paths.
- Live Gmail, Drive, Email, OAuth, token, and API paths.
- Settings live integration services.
- Dashboard, CEO Bureau, Brain Router, and other store-connected screens.
- `Knowledge_Base/`.
- `knowledge/`.
- restricted `insights/`.
- `brain-laws/`, unless separately approved as a static candidate source.
- Client, case, source, output, Dima, Tsila, and scans folders.
- File movement, deletion, renaming, OCR, and attachment content reading.

## 5. What Must Never Be Assumed Again

- Do not assume the whole Brain app is static or sandboxed.
- Do not assume a visual UI is safe just because it looks read-only.
- Do not assume Settings is safe because its controls are disabled; live services are still imported.
- Do not assume `main.tsx` is neutral; it initializes store/Supabase behavior.
- Do not assume CEO Bureau is read-only; it includes mutation-capable paths.
- Do not assume `knowledgeLog` is approved learning material.
- Do not assume a Learning Candidate is approved knowledge.
- Do not import all `insights/` automatically.
- Do not treat client/case folders as learning corpora without a separate approval gate.
- Do not create WorkItem, Matter, DocumentRef, persistence, OCR, or live connector behavior from a mock/local preview.

## 6. Current Safe Continuation Path

Safe continuation is limited to isolated static seed/type/test work unless explicitly
approved otherwise.

Allowed lane:

- Stage 5 planning/gate for read-only Gmail, Drive, and Scans intake.
- Stage 5A Gmail metadata mapping is completed and committed as static metadata-only work.
- Stage 5B Drive metadata mapping is completed and committed as static metadata-only work.
- Stage 5C Scans metadata mapping is completed and committed as static metadata-only work.
- Stage 5D Provider-Agnostic Metadata Adapter Boundary is completed and committed as static registry/type/test work.
- Stage 5E Unified Provider Preview is completed and committed as read-only UI consumption of the committed Stage 5D registry.
- Stage 6C-1 Scans Manifest static contract/tests is completed and committed.
- Stage 6C-2 Scans Manifest Preview UI is completed and committed as read-only/static UI.
- Stage 6D-0 Protocol `sourceType` contract extension is completed and committed.
- Stage 6D-1 Protocol metadata mapping is completed and committed as metadata-only static mock/test work.
- Stage 6 metadata intake foundation now covers Gmail, Drive, Scans, and Protocol.
- Scans have static manifest contract plus static preview UI.
- Live provider connections remain blocked until separate gates.
- Scans manifest loader remains blocked until a separate 6C-3 gate.
- Stage 6D Protocol Intake beyond metadata-only types/mocks/tests may proceed only as a planning gate until separately approved.
- Stage 7A Approval Gate static decision contract is completed and committed.
- Stage 7A approval scope is `metadata_preview_only`.
- Stage 7A allowed statuses are `pending_review`, `approved_for_candidate_preview`, `rejected`, `needs_more_evidence`, and `blocked`.
- Stage 7A approval means Eldad reviewed a metadata-only source and allows it to proceed later.
- Stage 7A `approved_for_candidate_preview` allows only later CandidatePreview generation.
- Stage 7A approval must not create WorkItem, Matter, DocumentRef, persistence, routing, provider action, task, calendar item, workflow item, or real operational state.
- Stage 7B Approval Gate Preview UI is completed and committed.
- Stage 7B route is `/internal/approval-gate-preview`.
- Stage 7B consumes only Stage 7A static `ApprovalDecision` fixtures.
- Stage 7B shows `metadata_preview_only` approval scope, approval statuses, safety flags, blocked operational effects, and `allowedNextStep`.
- Stage 7B is read-only and has no approval interaction, approve/reject/defer/block buttons, or `onClick` handlers.
- Stage 7B has no store, persistence, `localStorage`, Supabase, DB, WorkItem, Matter, DocumentRef, provider, API, OAuth, filesystem, OCR, or operational creation behavior.
- Stage 7C local ephemeral approval interaction is completed and committed.
- Stage 7C route remains `/internal/approval-gate-preview`.
- Stage 7C supports local simulation actions only:
  - Approve -> `approved_for_candidate_preview`
  - Reject -> `rejected`
  - Needs More Evidence -> `needs_more_evidence`
  - Blocked -> `blocked`
  - Reset -> original fixture state
- Stage 7C displays the permanent warning `⚠️ סימולציה בלבד — שום פעולה לא נשמרת`.
- Stage 7C displays a `[SIMULATED]` badge after local state changes.
- Stage 7 is completed only as internal/static/local simulation.
- Stage 7 does not create operational records or durable approval state.
- Stage 7C has no persistence, `localStorage`, `sessionStorage`, store, Supabase, DB, provider, API, OAuth, filesystem, OCR, WorkItem, Matter, DocumentRef, task, calendar, workflow, approval ledger, audit trail, or CandidatePreview creation behavior.
- Stage 8 Operational Object Preview contracts are completed and committed.
- Stage 8 commit is `a077533`.
- Stage 8 added `WorkItemPreview`, `MatterLinkPreview`, `DocumentRefPreview`, and `OperationalPreviewBundle`.
- Stage 8 preview objects are hypothetical only.
- Stage 8 bundles are `preview_only`.
- Stage 8 locks `canExecute=false`, `canPersist=false`, `requiresEldadApproval=true`, `creationBlocked=true`, and `creationBlockedReason='preview_only_no_persistence'`.
- Stage 8 has no real WorkItem, Matter, or DocumentRef creation, no store/persistence/localStorage/Supabase/DB, no Dashboard or CEO Bureau integration, no client/source/output file mutation, no provider/API/OAuth/filesystem/OCR, no UI, and no action execution.
- Stage 9 Real Actions Policy Map is completed and committed.
- Stage 9 commit is `27bbb8b`.
- Stage 9 is a static policy map only.
- Stage 9 defines 13 future real-action policies.
- Every Stage 9 policy has `status='blocked'`.
- Every Stage 9 policy has `implementationBlocked=true`.
- Stage 9 risk levels 0-4 are `none`, `low`, `medium`, `high`, and `critical`.
- Stage 9 manual-only actions are `generate_client_letter`, `submit_vat_report`, `submit_tax_filing`, `send_email_reply`, and `delete_file`.
- Stage 9 has no executors, `async`/`await`, provider calls, file operations, store/persistence, WorkItem/Matter/DocumentRef creation, output generation, Dashboard or CEO Bureau integration, or client/source/output mutation.
- Real actions remain blocked and require separate Agent A gate plus Eldad approval according to risk level.
- Stage 10 Professional Output Preview Contracts is completed and committed.
- Stage 10 commit is `e7c255b`.
- Stage 10 defines static professional output preview contracts, registry, fixtures, and tests only.
- Stage 10 output types are `letter`, `task_summary`, `scan_intake_report`, `protocol_action_summary`, `vat_review_memo`, `evidence_summary`, and `professional_opinion_draft`.
- Stage 10 output statuses are only `preview_draft` and `structural_placeholder`.
- Stage 10 has no `final`, `sent`, `filed`, `signed`, or `delivered` statuses.
- Every Stage 10 preview has `sourceIntakeId`, `sourceApprovalId`, `sourceOperationalPreviewId`, and `policyActionRef`.
- High-risk outputs require Eldad review.
- `professional_opinion_draft` is `critical`, `manualOnly`, and `neverAutoGenerate`.
- Every Stage 10 preview has `generationBlocked=true`.
- Stage 10 has no DOCX/PDF/Excel/HTML generation, file writes, template execution, export, client-facing final output, store/persistence, WorkItem/Matter/DocumentRef, provider/API/OAuth/filesystem/OCR, Dashboard or CEO Bureau integration, or client/source/output mutation.
- Stage 11 Static Professional Workflow Maps is completed and committed.
- Stage 11 commit is `52198f4`.
- Stage 11 domains are `protocol_task_management`, `client_case_filing`, `bookkeeping`, `vat`, `payroll`, `war_compensation`, `labor_law`, and `expert_opinions`.
- Stage 11 is static/descriptive only.
- Stage 11 has no workflow execution, Dashboard/CEO Bureau/Brain Router/Settings integration, or operational creation.
- Stage 11 has no Stage 10 typed imports; output references are ID strings only.
- Stage 11 capabilities are all false.
- Stage 12 Static QC and Eldad Approval Preview Contracts is completed and committed.
- Stage 12 commit is `b48d92e`.
- Stage 12 is QC preview only.
- Stage 12 has no QC ledger, persisted approval, or final approval state.
- Stage 12 approval decisions are `previewOnly`.
- Stage 12 locks `canFinalizeOutput=false`, `canExecuteAction=false`, and `canPersistDecision=false`.
- Stage 13 Evidence Spine Static Contracts is completed and committed.
- Stage 13 commit is `92a2d30 Add static evidence spine contracts`.
- Stage 13 added `EvidenceSpineItem`, `SourceTrace`, `VersionLineageRecord`, `FolderRelationshipPolicy`, `ArchiveDecisionPolicy`, `FileOperationBlockPolicy`, and `EvidenceApprovalRequirement`.
- Stage 13 Evidence Spine is metadata-only.
- Stage 13 `officialFolderRef` is conceptual metadata only and is not resolved to a real filesystem path.
- Stage 13 originals are immutable by policy.
- Stage 13 derived versions reference source lineage.
- Stage 13 low-confidence evidence remains unapproved.
- Stage 13 archive is proposal-only and requires Eldad approval.
- Stage 13 invariant is one official source folder per client/case.
- Stage 13 has no file movement, file copy, file rename, file delete, folder creation, archive execution, filesystem access, client/source/output folder mutation, persistence/store/localStorage/Supabase/DB, WorkItem/Matter/DocumentRef creation, provider/API/OAuth/OCR, Dashboard/CEO Bureau/Brain Router/Settings integration, or UI/runtime behavior.
- Stage 14 Learning Review Preview contracts are completed and committed.
- Stage 14 commit is `558ad8f`.
- Stage 14 is static learning review only.
- Stage 14 has no binding knowledge.
- Stage 14 locks `bindingKnowledge=false`, `persistenceAllowed=false`, `automaticLearningAllowed=false`, `memoryWriteAllowed=false`, `ragWriteAllowed=false`, `knowledgeLogWriteAllowed=false`, and `brainStoreWriteAllowed=false`.
- Stage 14 Stage 13 evidence references are string IDs only.
- Stage 14 has no brainStore, knowledgeLog, memory, RAG, Supabase, Gemini, persistence, automatic learning, or client/source/output file access.
- Stage 15 CEO Bureau Controlled Read Model is completed and committed.
- Stage 15 commit is `3d97dbe`.
- Stage 15 is a static isolated read model only.
- Stage 15 lives outside the live CEO Bureau runtime.
- Stage 15 has no import from `src/pages/ceo-office`.
- Stage 15 has no dashboard, route, store, provider, filesystem, persistence, or runtime integration.
- Stage 15 locks `previewOnly=true` and `readOnly=true`.
- Stage 15 mutation, execution, and persistence flags are all false.
- Stage 15 has no WorkItem/Matter/DocumentRef creation.
- Stage 15 has no action buttons, command handlers, execution, or finalization.
- Stage 16 Static Agentic Execution Limited contracts are completed and committed.
- Stage 16 commit is `ba1e808 Add static agentic execution contracts`.
- Stage 16 defines execution classes 0-5.
- Stage 16 class 0 is observe/read-display only.
- Stage 16 classes 1-5 have `executionBlocked=true`.
- Stage 16 has no executors, autonomous execution, provider/API/OAuth/filesystem/OCR, file movement/generation, store/persistence, WorkItem/Matter/DocumentRef, or CEO Bureau live integration.
- Stage 17 Daily Operating Snapshot contracts are completed and committed.
- Stage 17 commit is `67517f9 Add daily operating snapshot contracts`.
- Stage 17 is a static daily snapshot only.
- Stage 17 locks `previewOnly=true` and `readOnly=true`.
- Stage 17 has nine item groups: `newIntake`, `pendingApprovals`, `blockedItems`, `qcWarnings`, `workflowPreviews`, `outputPreviews`, `evidenceGaps`, `learningCandidates`, and `safeNextCandidates`.
- Stage 17 has no live dashboard widget, timer/scheduler, persistence/history, action buttons, or CEO Bureau/Dashboard integration.
- Stage 18 Robium / Salary / Clients static contracts are completed and committed.
- Stage 18 commit is `3f263e0 Add Robium salary clients static contracts`.
- Stage 18 added static contracts only for `RobiumProtocolSourcePreview`, `SalaryBureauWorkflowMap`, `ClientOperationDomainMap`, `PayrollOperationPreviewLock`, and `RobiumSafetyPolicyBundle`.
- Stage 18 has no live Robium integration, protocol API/webhook, payroll execution, salary calculations, real client/employee data, protocol-to-task automatic extraction, payslip/Form 106/tax submission, client communication, WorkItem/Matter/DocumentRef, store, or persistence.
- Stage 19 Multi-Agent Operations Static Contracts are completed and committed.
- Stage 19 commit is `233d7d6 Add static multi-agent operations contracts`.
- Stage 19 defines agent roles `agent_a`, `codex_main`, `codex_2`, `codex_3`, `gravity`, `auditor`, and `eldad`.
- Stage 19 keeps `live_execution` structurally blocked.
- Stage 19 has no agent execution, background jobs, schedulers, workers, queues, autonomous operation, or real actions.
- Manual Preview Workbench is completed and committed.
- Manual Preview Workbench commit is `519d19b Add manual preview workbench`.
- Manual Preview Workbench route is `/internal/manual-preview-workbench`.
- Manual Preview Workbench is the first usable internal work mode.
- Manual Preview Workbench accepts manual text/metadata input only.
- Manual Preview Workbench uses local React state only.
- Manual Preview Workbench provides a preview cascade only.
- Manual Preview Workbench has no persistence, provider/API/OAuth/filesystem/OCR, file upload, WorkItem/Matter/DocumentRef, output generation, or Save/Submit/Create/Send/File/Export/Execute/Sync/Import actions.
- Stage 20 Full Operational Brain Blueprint static contracts are completed and committed.
- Stage 20 commit is `2c8bbe0 Add full operational brain blueprint static contracts`.
- Stage 20 is the full static blueprint of all Brain layers.
- Stage 20 marks all completed capabilities as `static_preview_only`.
- Stage 20 keeps future live gates blocked.
- Stage 20 marks Manual Preview Workbench as the first post-20 usable mode.
- Stage 20 enables no operational path.
- Final current milestone: Stages 1-20 map is closed at safe static foundation / preview / mock / policy level.
- Stages 6-20 are implemented as safe contracts/fixtures/tests/previews.
- Manual Preview Workbench is available as the first usable internal work surface.
- Real actions remain blocked.
- Live providers remain blocked.
- Persistence remains blocked.
- File operations remain blocked.
- Operational object creation remains blocked.
- Agent autonomy remains blocked.
- There are still no live provider connections, persistence/store writes, file operations, operational object creation, agent autonomy, or client/source/output folder mutation.
- CandidatePreview lifecycle work may proceed only as static contracts/mocks/tests after explicit approval.
- Stage 6 live read-only provider gates remain planning/gate/read-only preview only until explicit implementation approval.
- Static source preview/type/test work only when explicitly approved.
- Metadata summary only.
- Static source references only.
- No full markdown body import.
- No dynamic file reading.
- No Brain store connection.
- No Supabase, RAG, KnowledgeSearch, dashboard, CEO Bureau, Brain Router, Settings,
  Gmail, Drive, API, OAuth, persistence, or operational action.

Safe work must remain isolated to internal static seed/type/test files unless explicitly approved.

## 7. Agent A Audit Result

- Agent A returned: `AGENT_A_BRAIN_AUDIT_READY`.
- Agent A approved the first VAT static seed path: `AGENT_A_VAT_STATIC_SEED_APPROVED`.
- The approved batch is limited to:
  - `insights/2026-04-21-vat-ingestion-vs-claiming.md`
  - `insights/2026-04-28-google-play-vat-treatment.md`

## 8. Codex State Sync Result

- Codex returned: `CODEX_STATE_SYNC_READY`.
- Staged area was confirmed empty at sync.
- Dirty workspace contains unrelated or separately gated work and must not be swept into commits.
- Current safe implementation surface is narrow: static Learning types/seed/tests only.

## 9. Open Risks

- Global app bootstrap calls store/Supabase initialization.
- Dashboard is store/repository connected.
- CEO Bureau includes mutation-capable paths.
- Settings imports live services even though the UI is frozen.
- The workspace has substantial unrelated dirty files.
- Broad lint/build may fail because of pre-existing unrelated rule violations.
- Learning Inbox UI is static and may not yet display every five-axis taxonomy detail unless separately approved.
- Stage 5 live-provider pressure must not bypass the existing no-live-connector boundary.
- Stage 3/4 source previews may look operational, but they remain static preview only.
- Stage 5A Gmail metadata mapping is not a live Gmail connector and must not be treated as OAuth/API readiness.
- Stage 5B Drive metadata mapping is not a live Drive connector and must not be treated as OAuth/API/read-content readiness.
- Stage 5C Scans metadata mapping is not a scanner integration and must not be treated as OCR/filesystem readiness.
- Stage 5D provider-agnostic metadata adapter registry is not a live provider layer and must not be treated as runtime connection readiness.
- Stage 5E unified provider preview is not a provider runtime and must not be treated as provider connection readiness.
- Stage 6D-1 protocol metadata mapping is not a live Protokol or Robium connector and must not be treated as transcript/task/calendar/workflow readiness.
- Stage 6 gate planning must not become live provider implementation without explicit later approval.
- Stage 7A approval gate static decisions are not a real approval ledger and must not be treated as persistence or operational authorization.
- Stage 7B approval preview UI is read-only and must not be treated as an approval interaction surface.
- Stage 7C local approval simulation is not durable approval state and must not be treated as a real approval ledger or audit trail.
- Stage 7 completion is internal/static/local simulation only and must not create operational objects, persistence, routing actions, provider actions, or store writes.
- Stage 8 operational previews are not operational objects and must not be treated as WorkItem, Matter, DocumentRef, persistence, routing, or execution readiness.
- Stage 9 policy entries are blocked governance records and must not be treated as executable real-action implementation.
- Stage 10 output previews are not generated client-facing outputs and must not be treated as DOCX/PDF/Excel/HTML generation, export readiness, file-write readiness, or final professional conclusions.
- Stage 11 workflow maps are static/descriptive maps and must not be treated as workflow execution, app integration, routing, persistence, or output generation readiness.
- Stage 12 QC approval previews are not a QC ledger, persisted approval, final approval state, or authorization to finalize output, execute actions, or persist decisions.
- Stage 13 Evidence Spine records are conceptual metadata only and must not be treated as real filesystem folders, file movement, folder creation, archive execution, DocumentRef creation, Matter linkage, WorkItem creation, or persistence readiness.
- Stage 14 Learning Review Preview records are not binding knowledge and must not be treated as memory, RAG, knowledgeLog, brainStore, Supabase, Gemini, persistence, or automatic learning readiness.
- Stage 15 CEO Bureau Controlled Read Model is isolated from the live CEO Bureau runtime and must not be treated as Dashboard, route, store, provider, filesystem, command, execution, finalization, or operational integration readiness.
- Stage 16 Agentic Execution Limited contracts are static constraints only and must not be treated as executor, autonomous execution, provider/API/OAuth/filesystem/OCR, store/persistence, file operation, operational object creation, or live CEO Bureau readiness.
- Stage 17 Daily Operating Snapshot contracts are static/read-only only and must not be treated as live dashboard widget, timer, scheduler, persistence history, action surface, or CEO Bureau/Dashboard integration readiness.
- Stage 18 Robium / Salary / Clients contracts are static only and must not be treated as live Robium integration, protocol API/webhook, payroll execution, salary calculation, client communication, payslip/Form 106/tax submission, automatic extraction, operational object, store, or persistence readiness.
- Stage 19 Multi-Agent Operations contracts are static only and must not be treated as agent execution, background job, scheduler, worker, queue, autonomous operation, production orchestration, or real-action readiness.
- Manual Preview Workbench is a local preview surface only and must not be treated as persistence, provider/API/OAuth/filesystem/OCR, file upload, output generation, operational object creation, or action execution readiness.
- Stage 20 Full Operational Brain Blueprint is a static map only and must not be treated as a live gate, operational path, runtime permission, provider connection, persistence permission, file-operation permission, operational object creation permission, or agent autonomy permission.
- CandidatePreview lifecycle pressure must not create WorkItem, Matter, DocumentRef, persistence, or provider actions.

## 10. Next Allowed Action Only

Current next real-world path:

- Use Manual Preview Workbench for work in preview mode.
- Manual Preview Workbench remains local-state-only and preview-only.
- Manual Preview Workbench must not save, submit, create, send, file, export, execute, sync, or import.
- Real actions remain blocked.
- Live providers remain blocked.
- Persistence remains blocked.
- File operations remain blocked.
- Operational object creation remains blocked.
- Agent autonomy remains blocked.

Next future gates:

- Live read-only provider metadata.
- Durable preview persistence.
- Approval ledger.
- First real WorkItem.
- First real DocumentRef.
- First controlled output draft.
- First controlled filing action.

Constraints for those actions:

- Stage 6C-3 may later add a read-only manifest loader only after a separate Agent A gate.
- Stage 6D beyond metadata-only types/mocks/tests may define Protocol Intake only as a planning gate unless separately approved.
- Protocol Intake must remain read-only and must not create real task, calendar, workflow, routing, persistence, or provider actions.
- Approval Gate implementation may define static/mock approval contracts and tests only.
- Approval means Eldad reviewed a metadata-only source and allows it to proceed later.
- Approval does not create WorkItem, Matter, DocumentRef, persistence, routing, or provider actions.
- CandidatePreview lifecycle work may define static contracts/mocks/tests only after explicit approval.
- One source may produce multiple candidate previews, but previews are not operational records.
- Any adapter contract or registry change must go back to Agent A.
- No live Gmail, Drive, Scans, Email, API, OAuth, token, or Local Vault connection.
- No provider runtime execution.
- No persistence or store writes.
- No operational records.
- No OCR.
- No physical file reads.
- No `fs.readdir`, `fs.readFile`, or `fs.stat`.
- No scanner driver integration.
- No file movement, deletion, rename, download, export, move, upload, or mutation.
- No WorkItem, Matter, or DocumentRef.
- No attachment content or document content ingestion.
- No operational action buttons or mutation callbacks.

## 11. Truth Cleanup - 2026-05-04

- HEAD verified: `a843121 Add VAT mapping table preview to manual workbench`.

Manual Preview Workbench committed history:

- `519d19b Add manual preview workbench`
- `c0e55c8 Add practical manual workbench guidance`
- `ece2e6b Polish manual workbench Hebrew UX`
- `bf24942 Reuse static Brain knowledge in manual workbench`
- `a843121 Add VAT mapping table preview to manual workbench`

Manual Preview Workbench current boundary:

- The VAT mapping table is preview-only.
- The Workbench remains local-state-only.
- No persistence.
- No provider/API/OAuth/OCR.
- No Maven live access.
- No Excel/PDF runtime reading.
- No WorkItem/Matter/DocumentRef creation.
- No accounting posting.
- No file generation.

Updated route/surface classification:

SAFE_STATIC:

- `/internal/manual-preview-workbench`
- `/internal/approval-gate-preview`
- `/internal/unified-intake`
- `/internal/scanned-intake`
- `/internal/learning-inbox`

READ_ONLY_DIAGNOSTIC:

- `/internal/brain-diagnostics`
- `BrainSpineMonitorPage` if routed later
- `OrphanIntakeInspectorPage` if routed later

LIVE_MUTATION_CAPABLE:

- `/work-spine`
- `/accounting-core`
- `/ceo`
- Matter Workspace

UNKNOWN_NEEDS_AUDIT:

- dirty/untracked runtime areas
- read-model/projection/services not verified in this cleanup
- dashboard/settings areas not verified in this cleanup

Current blockers:

- No VAT static evidence seed yet.
- No Workbench evidence wiring yet.
- No live Maven / Excel / PDF / OCR / provider access.
- No real WorkItem/Matter/DocumentRef from Manual Workbench.
- No agent autonomy.

`BRAIN_OPERATING_TRUTH_FULL_STATIC_FOUNDATION_UPDATED`
