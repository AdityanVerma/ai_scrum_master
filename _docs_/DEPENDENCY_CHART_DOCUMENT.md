# Dependency Chart Document: AI Scrum Master – Sprint Planning and Execution System

Date: 2026-09-23
Version: 1.0

---

## 1. AI Scrum Master – Scrum Master / Project Manager / Developer

**Function:** `planSprint`, `analyzeRequirements`, `breakDownTasks`, `analyzeDependencies`, `validateDependencies`, `correctDependencies`, `identifySkills`, `estimateTasks`, `buildSprintProposal`, `saveSprintProposal`, `activateSprint`, `updateTaskStatus`, `assignTask`, `recommendTaskAssignee`, `getTaskAssignmentCandidates`, `calculateSkillMatch`, `normalizeSkill`, `getSprintProgress`, `createDocument`, `getDocuments`, `createTeamMember`, `updateTeamMember`, `deleteTeamMember`

**Responsible Team/Module:**

- Frontend – Next.js App Router pages and layout components
- Backend – Next.js Route Handlers (API routes)
- AI Pipeline – OpenRouter / GPT-4o-mini via OpenAI SDK
- Database – PostgreSQL via Prisma ORM (`@prisma/adapter-pg`)
- Assignment Engine – Pure algorithmic skill matching (no AI)
- Document Management – Manual and sprint-scoped documentation

**Trigger:**

- User navigates to `/sprint-proposal` and submits the sprint planning form
- User activates a saved sprint from the sprint detail page
- User updates a task status from the sprint detail page
- User requests an assignee recommendation for a task
- User manually assigns a team member to a task
- User adds a document to a sprint or to the global documentation library
- User adds or edits a team member's profile and skills

---

## Frontend Changes

### Sprint Proposal Form (`/sprint-proposal`)

- Display a form with five fields: Sprint Name, Sprint Goal, Start Date, End Date, Functions/Features (one per line in a `<textarea>`).
- Validate that End Date is not before Start Date before submitting.
- Set `isGenerating` to `true` on submit; disable form submission while generating.
- On submit, call `POST /api/sprint-planning` with `{ name, goal, duration: { startDate, endDate }, functions[] }`.
- Display a loading indicator while the AI pipeline processes the request.

### Proposal Result – NEEDS_INFORMATION State

- When the API response has `status: 'NEEDS_INFORMATION'`, clear any previous proposal.
- Display a list of `requirementAnalysis.missingInformation[]` entries to guide the user in refining their sprint input.
- Keep the form populated with the previously entered values so the user can update and resubmit without re-entering data.

### Proposal Result – READY State

- When the API response has `status: 'READY'`, render the full `SprintProposal`:
  - Sprint name, goal, duration (start/end date), total estimated hours.
  - Task cards, each displaying: task ID, title, description, complexity badge (`LOW` / `MEDIUM` / `HIGH`), estimated hours, required skills (as tags), and task dependencies (as referenced task IDs).
- The proposal is already persisted at this point; no additional save action is required.

### Error State

- Display a single-line error message when:
  - End Date precedes Start Date (client-side validation).
  - API returns a non-JSON response or a non-200 HTTP status.
  - The AI pipeline throws an error.
- Clear the error state when the user modifies any form field.

### Sprint List Page (`/sprints`)

- Fetch all sprints from `GET /api/sprints` on mount.
- Display sprint cards with: name, goal, start date, end date, total estimated hours, status badge.
- Each card links to the sprint detail page at `/sprints/:id`.

### Sprint Detail Page (`/sprints/:id`)

- On mount, fire three parallel requests: `GET /api/sprints/:id`, `GET /api/sprints/:id/progress`, `GET /api/documents?sprintId=:id`.
- Also fetch `GET /api/team-members` for the manual assignment dropdown.

#### Sprint Activation

- Display an "Activate Sprint" button when sprint status is `PLANNED`.
- On click, call `PATCH /api/sprints/:id/activate`.
- On success, update sprint status in local state to `ACTIVE`; hide the activation button.
- Display an error message if activation fails.

#### Progress Bar

- Render a progress bar and counts for `todoTasks`, `inProgressTasks`, `doneTasks`, `blockedTasks`, and `progressPercentage`.
- Update displayed progress after each task status change.

#### Task Cards

- Render each task card with: title, description, complexity badge, estimated hours, skills, dependencies, assigned member name (or "Unassigned"), and status.
- Display a status dropdown per task; show only valid next transitions:
  - `TODO` → `IN_PROGRESS`, `BLOCKED`
  - `IN_PROGRESS` → `TODO`, `DONE`, `BLOCKED`
  - `DONE` → (no actions)
  - `BLOCKED` → `TODO`, `IN_PROGRESS`
- On status change, call `PATCH /api/sprints/:id/tasks/:taskId/status` with the new status.
- Disable the status dropdown while a status update is in progress for that task.

#### AI Assignment Recommendation

- Display a "Recommend Assignee" button per task.
- On click, set `loadingRecommendation` to the task's ID; disable the button.
- Call `POST /api/assignment/task-recommendation` with `{ taskId }`.
- Display the recommendation result showing `recommendedMember` (with `name`, `role`, `matchedSkills`, `missingSkills`, `matchPercentage`) and the full `candidates[]` list sorted by `matchPercentage` descending.
- Highlight the top candidate visually.

#### Manual Assignment

- Display a dropdown of all team members fetched from `GET /api/team-members`.
- On selection, call `PATCH /api/sprints/:id/tasks/:taskId/assignment` with `{ memberId }`.
- On success, update the displayed assigned member in local state without re-fetching the full sprint.

#### Document Management

- Display a list of sprint-scoped documents with title, type, source type badge, and creation date.
- Display an "Add Document" button that opens a modal form.
- The modal form collects: Title, Type (free text), Source Type (`DOCUMENT`, `LINK`, `UPLOAD`), Content (shown when `DOCUMENT`), URL (shown when `LINK`), File (shown when `UPLOAD`), Tags (comma-separated).
- On submit, call `POST /api/documents` with `{ title, type, sourceType, content, url, sprintId, tags[] }`.
- Upload (`UPLOAD`) source type is displayed in the UI but the API returns `501 Not Implemented`.
- On success, append the new document to the `documents` state without re-fetching.

### Team Members Page (`/team-members`)

- Fetch all team members from `GET /api/team-members` on mount.
- Display each member as a card with name, role, and skill tags.
- "Add Team Member" button is present in the UI but the add form is not yet wired up.

### Documentation Page (`/documentation`)

- Display all documents not scoped to a sprint.
- Supports the same add-document modal workflow as the sprint detail page, without the `sprintId` field.

### Navigation

- `Header.tsx` renders top-level navigation links: Dashboard (`/`), Plan Sprint (`/sprint-planning` — currently no matching page; `/sprint-proposal` is the functional route), Sprints (`/sprints`), Team (`/team-members`), Documentation (`/documentation`).
- Active route is highlighted with a green background (`bg-[#8CC9A8]`).

---

## Impact on User (Business Use Case)

### Scrum Master / Project Manager

- Can generate a fully structured sprint proposal in a single form submission, replacing hours of manual task decomposition.
- Receives AI-generated task breakdowns, dependency graphs, skill requirements, and time estimates from one interaction.
- Gets automatic detection of circular dependencies and invalid dependency graphs, reducing planning errors.
- Can activate a sprint and transition it from planning to execution state.
- Can track sprint execution progress at a glance with live task status counts and a progress percentage.
- Can get an instant AI-powered assignee recommendation per task based on skill matching, avoiding manual skill-to-member lookups.
- Can attach project documents, external links, and notes to a sprint, keeping relevant context co-located with the work.

### Developer / Team Member

- Can see which tasks are assigned to them and which are blocked or in progress.
- Can update their own task statuses within the enforced transition rules, preventing invalid state changes.
- Can view required skills per task to understand the technical scope before starting work.
- Can see which tasks depend on others, enabling better parallel planning.

---

## Does User Know What To Do (Navigation)

1. User clicks "Plan Sprint" in the top navigation.
2. User fills in Sprint Name, Sprint Goal, Start Date, End Date, and lists sprint features/functions (one per line).
3. User submits the form.
4. If the AI determines requirements are insufficient, the user sees a list of missing information and updates the form fields accordingly, then resubmits.
5. If the AI generates a proposal, the user sees task cards with complexity, estimated hours, skills, and dependencies. The sprint is automatically saved.
6. User navigates to "Sprints" in the top navigation to find the saved sprint.
7. User opens the sprint detail page and clicks "Activate Sprint" to begin execution.
8. For each task, the user can update the task status using the dropdown, following enforced transitions.
9. User can click "Recommend Assignee" on any task to see skill-matched team member candidates sorted by match percentage.
10. User can select a team member from the manual assignment dropdown to assign the task.
11. User can add documents or links to the sprint by clicking "Add Document" and completing the modal form.
12. If any operation fails, the user sees an inline error message and can retry the action.

---

## Dependency On

### External Services

- **OpenRouter** (`https://openrouter.ai/api/v1`) — AI gateway for all LLM calls in the sprint planning pipeline.
- **OpenAI GPT-4o-mini** (via OpenRouter) — model used for all AI steps: requirement analysis, task breakdown, dependency analysis, dependency validation, dependency correction, skill identification, and task estimation.

### External Scripts or URLs

- OpenRouter API endpoint: `https://openrouter.ai/api/v1` (configured in `openrouter.ts`).

### Frontend Components

- `src/app/sprint-proposal/page.tsx` — Sprint input form and proposal display
- `src/app/sprints/page.tsx` — Sprint list
- `src/app/sprints/[id]/page.tsx` — Sprint detail: task management, assignment, progress, documents
- `src/app/team-members/page.tsx` — Team member management
- `src/app/documentation/page.tsx` — Global documentation library
- `src/components/layout/Header.tsx` — Top navigation with route highlighting
- `src/components/layout/PageContainer.tsx` — Shared max-width content wrapper
- `src/app/layout.tsx` — Root layout wrapping all pages with the `Header`

### Backend APIs

| Route | Method | Purpose |
|---|---|---|
| `/api/sprint-planning` | POST | Run the full AI pipeline and persist the sprint |
| `/api/sprints` | GET | List all sprints |
| `/api/sprints/:id` | GET | Fetch single sprint with tasks, skills, dependencies, assignee |
| `/api/sprints/:id/activate` | PATCH | Transition sprint from `PLANNED` to `ACTIVE` |
| `/api/sprints/:id/progress` | GET | Fetch task status counts and progress percentage |
| `/api/sprints/:id/tasks/:taskId/status` | PATCH | Update task status with transition enforcement |
| `/api/sprints/:id/tasks/:taskId/assignment` | PATCH | Assign a team member to a task |
| `/api/assignment/task-recommendation` | POST | Get the top recommended assignee for a task |
| `/api/assignment/task-candidates` | POST | Get all skill-matched candidates for a task |
| `/api/assignment/candidates` | POST | Get candidates for a given skill array |
| `/api/documents` | GET, POST | List or create documents |
| `/api/team-members` | GET, POST | List or create team members |
| `/api/team-members/:id` | GET, PATCH, DELETE | CRUD for a single team member |

### Database

- **PostgreSQL** — primary relational database
- **Prisma ORM 7.9.1** with `@prisma/adapter-pg` driver adapter
- Tables / models:
  - `Sprint` — sprint header data (name, goal, dates, totalEstimatedHours, status)
  - `SprintTask` — individual tasks (taskId, title, description, complexity, estimatedHours, status)
  - `SprintFunction` — list of feature/function strings associated with a sprint
  - `TeamMember` — team member profile (name, role)
  - `TeamMemberSkill` — many-to-one skill records per team member
  - `TaskSkill` — many-to-one skill records per task
  - `TaskDependency` — self-join on `SprintTask` representing task-to-task dependencies
  - `Document` — documents with title, type, sourceType, content, url, sprintId (optional)
  - `DocumentTag` / `DocumentTagRelation` — many-to-many tags for documents
  - `DocumentFunctionRelation` — links documents to sprint functions (schema present, not yet used in UI)
- Enums: `SprintStatus` (`PLANNED`, `ACTIVE`, `COMPLETED`, `CANCELLED`), `TaskStatus` (`TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`), `TaskComplexity` (`LOW`, `MEDIUM`, `HIGH`), `DocumentSource` (`MANUAL`, `AI_GENERATED`), `DocumentSourceType` (`DOCUMENT`, `LINK`)

### Browser APIs

- `window.location.pathname` — used on the sprint detail page to extract `sprintId` from the URL (instead of using the Next.js `useParams` hook).
- Fetch API (`fetch`) — used for all HTTP calls to the backend.
- DOM event handling — `FormEvent`, `ChangeEvent` for form interactions.

### UI Components

- Sprint planning form: text inputs, date inputs, `<textarea>` for functions list
- Sprint proposal display: task cards with skill tags and complexity badges
- Sprint list: sprint summary cards
- Sprint detail: progress bar, task status dropdowns, assignment dropdown, recommendation result panel, document add modal
- Team members: member profile cards
- Loading indicators: inline per-form and per-button `isGenerating` / `isActivating` / `loadingRecommendation` states
- Error messages: inline single-line error text per page/form
- Missing information list: rendered when AI returns `NEEDS_INFORMATION`
- Document modal: conditional field rendering based on selected `sourceType`

### State Management

All state is managed locally with React `useState` per page. There is no global state management library. Key states per page:

**`/sprint-proposal` page:**
- `formData` — sprint form field values
- `isGenerating` — boolean for loading state
- `sprintProposal` — `SprintProposal | null` — the AI-generated proposal
- `missingInformation` — `string[]` — missing requirement details
- `error` — `string | null` — error message

**`/sprints/:id` page:**
- `sprint` — full sprint object with nested tasks
- `progress` — task counts and percentage
- `recommendations` — `Record<taskId, AssignmentRecommendation>` — per-task recommendation cache
- `teamMembers` — full list for the assignment dropdown
- `documents` — sprint-scoped document list
- `isDocumentFormOpen`, `documentTitle`, `documentType`, `documentSourceType`, `documentContent`, `documentUrl`, `documentFile`, `documentTags` — document add form state
- `isCreatingDocument`, `isLoading`, `loadingRecommendation`, `isActivating`, `error` — loading and error states

### AI Pipeline Modules

- `src/lib/ai/openrouter.ts` — OpenAI SDK client configured to OpenRouter (`OPENROUTER_API_KEY`)
- `src/lib/ai/sprint-planning/sprint-planning.ts` — Pipeline orchestrator (`planSprint`)
- `src/lib/ai/sprint-planning/requirement-analysis.ts` — Step 1: `analyzeRequirements`
- `src/lib/ai/sprint-planning/task-breakdown.ts` — Step 2: `breakDownTasks`
- `src/lib/ai/sprint-planning/dependency-analysis.ts` — Step 3: `analyzeDependencies`
- `src/lib/ai/sprint-planning/dependency-validation.ts` — Step 4: `validateDependencies`
- `src/lib/ai/sprint-planning/dependency-correction.ts` — Step 5: `correctDependencies`
- `src/lib/ai/sprint-planning/skill-identification.ts` — Step 6: `identifySkills`
- `src/lib/ai/sprint-planning/task-estimation.ts` — Step 7: `estimateTasks`
- `src/lib/ai/sprint-planning/build-sprint-proposal.ts` — Step 8: `buildSprintProposal`

### Assignment Engine

- `src/lib/assignment/normalize-skill.ts` — `normalizeSkill`: lowercase, strip dots/hyphens/underscores for fuzzy skill comparison
- `src/lib/assignment/calculate-skill-match.ts` — `calculateSkillMatch`: returns `matchedSkills`, `missingSkills`, `matchPercentage`
- `src/lib/assignment/get-assignment-candidates.ts` — `getAssignmentCandidates`: fetches all team members, calculates and sorts by match
- `src/lib/assignment/get-task-assignment-candidates.ts` — `getTaskAssignmentCandidates`: fetches task skills then delegates to `getAssignmentCandidates`
- `src/lib/assignment/recommend-task-assignee.ts` — `recommendTaskAssignee`: returns top candidate as `recommendedMember` plus full `candidates[]`
- `src/lib/assignment/find-members-by-skills.ts` — `findMembersBySkills`: returns members with ANY matching skill

### Validation Library

- **Zod 4.4.3** — All AI API responses are parsed and validated with Zod schemas before use in the pipeline. Each pipeline step has its own Zod schema (e.g., `requirementAnalysisSchema`).

### Permissions and Roles

- No authentication or authorization system is implemented.
- All routes and pages are publicly accessible.
- Role distinctions (Scrum Master vs. Developer) are implied by workflow context but not enforced technically.

---

## Integration Aspects

### Scalability

- New AI pipeline steps can be added to `planSprint()` by creating a new module in `src/lib/ai/sprint-planning/` and inserting it in the sequential pipeline. No architectural refactoring required.
- The `functions[]` input field allows any number of feature strings, making the pipeline applicable to small and large sprints without code changes.
- New sprint status transitions (`COMPLETED`, `CANCELLED`) can be added to `update-task-status.ts` and corresponding API routes without schema changes, as the enums already include those values.
- The `DocumentFunctionRelation` table is already in the schema and ready to support document-to-function linking if a UI is added.
- The `DocumentSource` enum already includes `AI_GENERATED`, enabling future AI-driven document creation without a schema migration.
- The `src/modules/sprint/` directory and `src/jobs/` directory are scaffolded for modular and background job expansion.

### Security

- `OPENROUTER_API_KEY` and `DATABASE_URL` are stored as environment variables and are never exposed to the client side.
- All AI API calls are server-side (inside Next.js Route Handlers).
- There is no authentication, authorization, or session management. Any user with network access to the application can create, modify, or delete sprints, team members, and documents.
- User-supplied sprint input (name, goal, functions) is sent directly to the AI model. No sanitization or length limits are applied before the LLM prompt is constructed.
- No input validation library (such as Zod) is used on the API request body for most endpoints; basic `if (!body.name || !body.goal...)` checks are present in the sprint planning route.
- The sprint detail page extracts `sprintId` via `window.location.pathname.split("/").pop()` — this is a client-side operation and does not perform server-side ID validation beyond what Prisma throws.

### Performance

- The `planSprint()` pipeline makes **seven sequential LLM API calls** (steps 1–7; step 8 is synchronous). Each call has independent latency from OpenRouter/GPT-4o-mini. Total pipeline duration can be 15–60+ seconds depending on OpenRouter response times and task count.
- There is no caching of AI responses. Each form submission triggers the full pipeline regardless of whether the input is similar to a prior run.
- The sprint detail page fires three parallel `fetch` calls on mount, which is a good pattern.
- The `getAssignmentCandidates()` function fetches all team members from the database on every recommendation request; there is no pagination or caching.
- Document and sprint list pages have no pagination; all records are fetched on every page load.

### Reliability

- If any of the seven sequential LLM calls fails (network error, OpenRouter outage, invalid JSON response), the entire `planSprint()` pipeline throws and returns a `500` error to the user. There is no partial result recovery or step-level retry.
- AI responses are validated with Zod. If the model returns a structurally invalid JSON response, the pipeline throws immediately.
- If `buildSprintProposal()` detects a missing estimate for any task (`!estimate`), it throws synchronously, which will propagate as a 500 error.
- The sprint detail page handles fetch failures by setting an `error` state and displaying the message inline.
- Task status transitions are enforced at the database layer (`updateTaskStatus`), preventing invalid states regardless of client behavior.
- The `DONE` status is a terminal state — once set, it cannot be reversed.

### Maintainability

- The AI pipeline is decomposed into eight single-responsibility modules, each independently testable.
- Each pipeline module owns its own Zod schema for response validation.
- The assignment engine is fully algorithmic with no AI dependency, making it fast and predictable to test.
- `normalizeSkill()` centralizes all skill string normalization logic; updating the normalization rules affects all downstream matching.
- The `PageContainer` component enforces consistent layout across all pages from a single file.
- Hardcoded color tokens (e.g., `#4E9F7C`, `#1F2924`) are repeated inline across components rather than centralized in a design token system.
- The legacy `sprint-proposal.ts` and `/api/sprint-proposal` route are still present alongside the multi-step pipeline, creating two code paths for what is conceptually the same feature.

### Vulnerabilities

- **No authentication** — any user can modify any sprint, task, team member, or document.
- **No input length or format validation** on sprint planning inputs before LLM prompt construction — long or adversarial input could inflate token usage or cause unexpected LLM behavior.
- **Sequential LLM pipeline with no retry** — a single transient network failure on any of the seven steps will fail the entire sprint planning operation.
- **`window.location.pathname` for route parameter extraction** — bypasses Next.js routing and is fragile if the URL structure changes.
- **No pagination** on team members, sprints, or documents — large datasets will degrade performance and may cause timeouts.
- **Document upload returns 501** — users who attempt to upload files receive a not-implemented response with no fallback.
- **`Add Team Member` button has no handler** — the feature is visually present but non-functional.
- **`/sprint-planning` nav link points to a non-existent route** — users clicking "Plan Sprint" in the header will get a 404 if no page exists at that path.
- **Vendor lock-in to OpenRouter/GPT-4o-mini** — all AI prompts and schemas are tuned to this model. Switching providers requires re-validating all seven pipeline steps.
- **`AI_GENERATED` document source not used** — the infrastructure is in place but no pipeline creates documents automatically; the value is unreachable from the current UI.

---

## Possible Validations Required

### Input Validation

- Validate that sprint `name` is non-empty and within a reasonable length limit.
- Validate that sprint `goal` is non-empty and within a reasonable length limit.
- Validate that `startDate` and `endDate` are valid ISO date strings.
- Validate that `endDate` is not before `startDate` (currently client-side only; must also be enforced server-side).
- Validate that `functions[]` is non-empty and contains at least one non-whitespace entry.
- Validate that each function string is non-empty after trimming.
- Validate `taskId` in status and assignment update routes is a valid CUID or matches the sprint's task set.
- Validate that the `status` value in the task status update route is one of the four valid `TaskStatus` enum values.
- Validate that `memberId` in the task assignment route refers to an existing `TeamMember` record.
- Validate that document `title` and `type` are non-empty.
- Validate that `url` is a valid URL when `sourceType` is `LINK`.
- Validate that `content` is non-empty when `sourceType` is `DOCUMENT`.

### State Validation

- Prevent sprint activation if status is not `PLANNED`.
- Prevent task status transitions that violate the `allowedTransitions` map (already enforced in `updateTaskStatus`).
- Prevent task assignment when the sprint is `CANCELLED`.
- Prevent duplicate `TaskDependency` records (already enforced by the unique constraint `[taskId, dependsOnTaskId]`).
- Prevent saving a sprint with no tasks (if `buildSprintProposal` returns an empty task list).

### Service Validation

- Verify that the OpenRouter API key is set and valid before initiating the pipeline.
- Verify that each AI pipeline step returns a non-empty `choices[0].message.content` string.
- Verify that each AI response parses as valid JSON before applying the Zod schema.
- Handle the case where `buildSprintProposal` cannot find an estimate for a task gracefully rather than throwing.
- Verify that `saveSprintProposal` commits successfully before returning `READY` to the client.

### Permission Validation

- Not currently applicable — no authentication or authorization is implemented.
- Future: Verify that the requesting user has access to the sprint before allowing status updates or assignments.

### Persistence Validation

- Verify that the `taskIdMap` in `saveSprintProposal` correctly maps all AI-generated task IDs to database IDs before creating `TaskDependency` records.
- Verify that `validDependencies` filters out any unmapped task ID pairs to avoid foreign key violations.
- Verify that tag names are normalized before upsert to prevent duplicate tag records with different casings.

### Error Recovery Validation

- Verify that after a `NEEDS_INFORMATION` response, the form retains all previously entered values so the user can correct and resubmit.
- Verify that after a `500` error from the pipeline, `isGenerating` is reset to `false` so the form becomes interactive again.
- Verify that loading states (`loadingRecommendation`, `isActivating`, `isCreatingDocument`) are reset on both success and failure paths.

---

## Possible Test Case Scenarios

### Positive Scenarios

- Submit a well-defined sprint with a clear goal and multiple functions; verify the proposal returns `status: 'READY'` with tasks, skills, complexity badges, and estimated hours.
- Verify that the returned `totalEstimatedHours` equals the sum of all individual task `estimatedHours`.
- Verify that the saved sprint appears in the `/sprints` list page after proposal generation.
- Activate a `PLANNED` sprint and verify the status changes to `ACTIVE` in the UI and database.
- Update a task from `TODO` to `IN_PROGRESS` and verify the status dropdown updates and the progress bar reflects the change.
- Request an assignee recommendation for a task with known skills and verify the top candidate has the highest `matchPercentage`.
- Assign a team member manually and verify the task card displays the assigned member's name.
- Add a document with `sourceType: DOCUMENT` and verify it appears in the sprint's document list.
- Add a team member with multiple skills and verify the skills appear as tags on the team member card.

### Persistence Scenarios

- Submit a sprint proposal, navigate away, and return to `/sprints`; verify the sprint is listed with correct name and dates.
- Reload the sprint detail page and verify task statuses, assignments, and documents are still correct.
- Add a document, refresh the page, and verify the document is still listed.

### Negative Scenarios

- Submit the sprint form with End Date before Start Date; verify the client-side error message appears and the form is not submitted.
- Submit a sprint with a vague goal and minimal function descriptions; verify the AI returns `NEEDS_INFORMATION` with a list of missing details.
- Attempt to move a task from `DONE` to any other status; verify the API returns an error and the task status remains `DONE`.
- Attempt to activate an already `ACTIVE` sprint; verify the API returns an error.
- Submit a document with `sourceType: LINK` and no URL; verify appropriate validation error.
- Request an assignee recommendation for a task when no team members exist; verify the API returns `recommendedMember: null` and an empty `candidates[]`.

### UI and State Scenarios

- Verify the form submission button is disabled while `isGenerating` is `true`.
- Verify the "Activate Sprint" button is hidden after successful activation.
- Verify the `loadingRecommendation` state disables the "Recommend Assignee" button for the specific task being processed, not all tasks.
- Verify the missing information list clears when a subsequent submission returns `READY`.
- Verify the document modal form shows the Content field when `sourceType` is `DOCUMENT` and the URL field when `sourceType` is `LINK`.
- Verify an error message appears for a failed activation attempt and the button becomes interactive again.

### Integration Scenarios

- Verify that the full AI pipeline persists all eight data components: sprint record, sprint functions, tasks, task skills, and task dependencies in one transaction.
- Verify that `TaskDependency` records reference valid database IDs (not AI-generated string IDs).
- Verify that `calculateSkillMatch` correctly normalizes skill strings (e.g., "React.js" matches "reactjs", "Node.js" matches "nodejs").
- Verify that documents tagged with comma-separated tags are split, trimmed, and upserted correctly.
- Verify that the `DocumentFunctionRelation` cascade deletes when a `SprintFunction` is deleted.
- Verify that deleting a sprint cascades to delete its associated tasks, functions, and unlinks its documents (sets `sprintId` to null).

### Edge Cases

- Submit a sprint with a single function and verify a minimal but valid proposal is generated.
- Submit a sprint where all tasks generated by the AI have no dependencies; verify no `TaskDependency` records are created.
- Add a team member with no skills and request an assignee recommendation; verify the member appears with `matchPercentage: 0` and empty `matchedSkills`.
- Submit a sprint where the AI dependency analysis produces a circular dependency; verify `validateDependencies` detects it and `correctDependencies` removes it before the sprint is saved.
- Add the same skill to a team member twice; verify the unique constraint prevents duplicate `TeamMemberSkill` records.
- Assign a team member to a task, then delete that team member; verify the task's `assignedToId` is set to `null` and the task remains accessible.

---

## Possible Worst Case Scenario

- OpenRouter becomes unavailable mid-pipeline, causing all sprint planning requests to fail with `500` errors. Users cannot create new sprints until the service recovers.
- The AI model returns structurally invalid JSON for one of the seven pipeline steps, causing the Zod parse to throw. No partial sprint data is saved, and the user must restart from scratch.
- `buildSprintProposal` cannot find an estimate for one or more tasks (mismatched AI-generated task IDs between pipeline steps), throwing an error and discarding a nearly complete planning run.
- `saveSprintProposal` partially completes before a database failure, leaving orphaned `SprintTask` or `TaskSkill` records if not wrapped in a transaction — or losing the sprint entirely if the transaction rolls back.
- A user inadvertently sets all sprint tasks to `DONE` while dependencies are unresolved, as the current system does not validate whether dependency tasks are completed before allowing downstream tasks to be marked done.
- With no authentication, a user can delete all team members, unassigning every task across all sprints, with no audit trail.
- The "Plan Sprint" header navigation link (`/sprint-planning`) leads to a 404 page, blocking new users from discovering the sprint creation feature.
- The `window.location.pathname.split("/").pop()` pattern on the sprint detail page fails silently if the URL structure changes (e.g., trailing slash), resulting in undefined `sprintId` passed to all three parallel API calls, causing all to return errors on load.
- Submitting very long sprint goals or function lists could exhaust the GPT-4o-mini context window, causing the LLM to truncate output or return an error, with no graceful handling in the pipeline.

---

## Expected Issues

### Global

- No authentication or authorization means the application is unsuitable for multi-team or public deployment without a significant security layer being added.
- No pagination across sprints, tasks, team members, or documents — large datasets will increase page load times and potentially cause database query timeouts.
- The "Plan Sprint" navigation link (`/sprint-planning`) does not resolve to an existing page; users following it will see a 404.

### Function-Specific

- The seven sequential AI pipeline calls have no retry logic; transient network errors will fail the entire sprint generation.
- `buildSprintProposal` throws if an estimate is missing for any task, with no fallback to default values.
- The legacy `/api/sprint-proposal` route and `sprint-proposal.ts` module coexist with the multi-step pipeline, creating maintenance confusion and potential inconsistency in output.
- `window.location.pathname.split("/").pop()` is used instead of the Next.js `useParams` hook or `params` prop, making the sprint detail page fragile to URL structure changes.
- `correctDependencies` is only invoked if `validateDependencies` returns `isValid: false`; however, if the corrected dependencies still contain issues, no second validation pass is run.
- The `totalEstimatedHours` field on the `Sprint` model is set once at creation time and is never recalculated if task estimates change.

### UI/UX

- The "Add Team Member" button on the `/team-members` page has no handler; clicking it does nothing.
- Document upload (`sourceType: UPLOAD`) is shown in the UI but returns `501 Not Implemented` from the API, providing no feedback to the user about why the upload fails.
- Loading and error states are scoped per-page and not globally managed; a slow AI pipeline operation provides no visible progress indication beyond the button disabling.
- Translated text or very long task descriptions may overflow task card layouts as no text truncation or responsive overflow handling is confirmed.
- The active nav link in `Header.tsx` is matched by exact `pathname` equality; nested routes (e.g., `/sprints/abc123`) will not highlight the "Sprints" nav item as active.

### Integration

- `DocumentFunctionRelation` is defined in the schema but has no corresponding API routes, UI entry points, or query logic — this relation is currently unreachable.
- `DocumentSource.AI_GENERATED` enum value exists but no pipeline creates `AI_GENERATED` documents, making the value unused.
- `SprintStatus.COMPLETED` and `SprintStatus.CANCELLED` exist in the schema but no API route transitions sprints to these states.
- `src/modules/sprint/` and `src/jobs/` directories are scaffolded but entirely empty, suggesting planned architecture that has not been implemented.

### Performance

- Each sprint planning request triggers seven sequential LLM calls. For a sprint with many functions, each step's prompt can be large, increasing latency.
- `getAssignmentCandidates` fetches all team members on every recommendation request — as the team grows, this becomes an increasingly expensive DB query with no limit or index strategy.
- Documents, sprints, and team members are fetched without pagination, which will degrade as data volume grows.

---

## Assumptions

- `OPENROUTER_API_KEY` is set as a valid environment variable in the deployment environment.
- `DATABASE_URL` is set to a valid and reachable PostgreSQL connection string.
- The PostgreSQL database schema has been migrated to match `prisma/schema.prisma` before the application is started.
- The OpenRouter API and GPT-4o-mini model are accessible and return valid JSON responses conforming to the Zod schemas for each pipeline step.
- All seven AI pipeline steps return responses where task IDs are consistent across steps (i.e., the IDs generated in `breakDownTasks` are used unchanged by `analyzeDependencies`, `identifySkills`, and `estimateTasks`).
- The `functions[]` input array items are human-readable feature descriptions in English, matching the language expected by the AI prompts.
- LLM temperature settings (0.1–0.2) are sufficient to produce deterministic-enough outputs for the dependency graph and skill mapping steps.
- The `normalizeSkill` function's normalization rules (lowercase, strip dots/hyphens/underscores) produce sufficient fuzzy matching for the skill strings used by the team and AI pipeline.
- Sprint tasks reach a `DONE` state only after their dependency tasks have also been completed; this is not currently enforced by the system.
- The application is deployed in a trusted internal environment given the absence of authentication.
- `window.location.pathname` is reliable in the environment where the application is deployed and does not introduce cross-browser inconsistencies.
- The legacy `sprint-proposal.ts` and `/api/sprint-proposal` route are intentionally retained for backward compatibility or testing purposes, and are not expected to be the primary path for new sprints.
- Exact API endpoint for any standalone diagnostic routes (`/api/requirement-analysis`, `/api/task-breakdown`, `/api/skill-identification`, `/api/task-estimation`, `/api/dependency-analysis`, `/api/test-ai`) is to be confirmed; these routes exist as files but their handlers were not read during analysis.
