# Internal Management System: Documentation Feature — Completed Work

*An implementation summary of the functionality completed so far in the Internal Management System, covering the sprint planning workflow, task management enhancements, assignee recommendations, and the central Documentation module.*

---

## Why this document exists

This document records the functionality implemented and verified so far in the Internal Management System. It describes the user's intent, the resulting outcome, the implemented solution, how it supports the workflow, and the current limitations or future scope.

The purpose is to provide a single reference for the completed work before moving on to the next feature set.

*Last checked against the code: 29 September 2026. Corrections made in that check are marked "(updated)". Section 16 and the changes marked "(Updated 30 September)" were added on 30 September 2026.*

---

## Guiding principles carried through the implementation

- **Build incrementally.** Features were implemented in small, testable steps rather than introducing the entire workflow at once.
- **Keep the interface practical.** The UI focuses on actions users need during sprint planning, execution, and documentation management.
- **Preserve existing workflows.** New functionality was integrated into the existing sprint detail page and API structure without replacing working features.
- **Separate metadata from content.** Documents contain structured information such as title, type, source, tags, and sprint association.
- **Support both sprint-specific and general documentation.** Documentation can belong to a particular sprint or remain available as general project documentation.
- **Verify each change.** Each major implementation step was tested in the running application before proceeding.

---

# 1. AI Sprint Planning

## Intent

- The user wants to convert project requirements into a structured sprint proposal with actionable implementation information.
- The system should reduce manual planning effort by using AI to analyze requirements and generate planning outputs.

## Outcome

- The system can generate and save sprint proposals.
- Generated sprint information becomes available in the Internal Management System for further execution and tracking.

## Current solution

- AI-driven sprint planning generates structured sprint proposal data.
- The proposal includes sprint-related information and associated functions.
- Sprint proposals can be persisted in the database.
- Saved sprints are visible in the application after creation.
- The Plan Sprint page (`/sprint-proposal`) calls `/api/sprint-planning`, which runs the AI planning steps in order (requirement analysis, task breakdown, dependency analysis, dependency validation and correction, skill identification, task estimation), builds the proposal, and saves it.
- The skill identification step handles AI responses that are returned inside Markdown JSON code fences (updated: this is not applied to the other steps, see limitations).

## Implementation details

- Added handling in `skill-identification.ts` for AI responses wrapped in fenced blocks such as:

  ```text
  ```json
  { ... }
  ```
  ```

- Cleaned the AI response before parsing it with `JSON.parse`.
- Ensured sprint functions are included in the generated proposal.
- Persisted sprint functions when saving the sprint proposal.
- Confirmed that sprint creation and saved sprint visibility work correctly.

## How it helps the workflow

- Reduces the manual effort required to convert requirements into sprint-level planning data.
- Creates a structured starting point for task breakdown, assignment, and execution.
- Keeps generated planning information available for later sprint management.

## Assumptions and limitations

- AI-generated output must still be validated before being treated as final planning decisions.
- The quality of the generated sprint proposal depends on the quality and completeness of the requirements supplied.
- (Updated) Only the skill identification step strips Markdown code fences. The other six steps call `JSON.parse` on the raw AI response, so a fenced response in any of them would fail. A shared cleanup helper would fix this.
- (Updated) The older single-call route `/api/sprint-proposal` and its helper files were removed because nothing used them.

---

# 2. Sprint Functions

## Intent

- The user wants each sprint to retain the functions or capability areas that define its scope.
- These functions should remain available after the sprint proposal is saved.

## Outcome

- Sprint functions are generated, stored, and associated with the relevant sprint.

## Current solution

- `SprintProposal` includes a `functions` array.
- `buildSprintProposal` returns the functions received in the input.
- `saveSprintProposal` creates the corresponding sprint functions in the database.

## How it helps the workflow

- Keeps the sprint's intended functional scope visible.
- Provides structured information that can later support filtering, documentation association, and progress analysis.
- Prevents important planning context from being lost after sprint creation.

## Assumptions and limitations

- Functions are currently stored as sprint-level information.
- Additional function-based filtering or reporting can be added later.

---

# 3. Task Management and Dependency Visibility

## Intent

- The user wants to understand which tasks depend on other tasks.
- Dependencies should be readable directly from the sprint detail interface instead of requiring users to inspect raw IDs.

## Outcome

- Task dependencies are displayed with the dependent task's task ID and title.

## Current solution

- The backend sprint query includes dependency relationships.
- Each dependency includes the related task it depends on.
- The frontend task type was updated to represent dependency information.
- Dependency labels are rendered in a readable format:

  ```text
  TASK-001 - Example task title
  ```

## Implementation details

The backend includes:

- `dependencies`
- Related `dependsOn` task
- `dependedOnBy` relationship

The frontend displays each dependency using:

```text
{dependency.dependsOn.taskId} - {dependency.dependsOn.title}
```

Multiple dependencies are shown as one comma-separated line.

## How it helps the workflow

- Makes task sequencing easier to understand.
- Helps users identify blockers and prerequisite work.
- Reduces confusion caused by displaying only database identifiers.
- Supports better sprint execution and coordination.

## Assumptions and limitations

- The current implementation focuses on visibility.
- Future improvements may include dependency graphs, blocker indicators, and dependency status tracking.

---

# 4. Assignee Recommendation and Manual Assignment (updated)

## Intent

- The user wants help identifying an appropriate team member for a task.
- The system should provide a recommendation while still allowing the user to make the final assignment decision.

## Outcome

- Users can request an assignee recommendation for a task.
- The recommended member can be assigned directly through the interface.
- Users can also assign any team member manually from a dropdown on each task.

## Current solution

- A task recommendation API endpoint is available at:

  ```text
  /api/assignment/task-recommendation
  ```

- The sprint detail page includes a `Recommend Assignee` action and an `Assign Manually` dropdown.
- The recommendation is rule-based, not AI-generated: the task's required skills are compared with each member's skills, and candidates are ranked by skill match percentage. The top candidate is recommended and the match percentage is shown.
- A task with no required skills returns no candidates.
- The existing `Assign` action uses the recommended member's ID to assign the task.

## Implementation details

The assignment flow connects the recommended member to the existing assignment handler:

```tsx
const recommendedMember =
    recommendations[task.id]?.recommendedMember;

if (recommendedMember) {
    handleAssignRecommended(
        task.id,
        recommendedMember.memberId,
    );
}
```

## How it helps the workflow

- Reduces the effort required to manually evaluate possible assignees.
- Connects AI recommendations to an actual assignment action.
- Keeps the user in control of the final assignment.
- Supports faster task distribution during sprint execution.

## Assumptions and limitations

- Recommendations should be treated as assistance rather than automatic final decisions.
- Recommendation quality depends on the available member, skill, and task information. Workload and availability are not part of the ranking.
- The recommendation endpoint must remain available for the UI action to work.

---

# 5. Documentation Data Model

## Intent

- The user wants documentation to be stored as a structured, reusable resource rather than as unorganized text.
- Documents should support manual content, external links, tags, and sprint association.

## Outcome

- A dedicated `Document` model and related models are available in the database.
- Documents can be associated with a sprint or remain general documentation.

## Current solution

The `Document` model includes:

- Document ID
- Title
- Type
- Source type
- Content
- URL
- Source
- Optional sprint association
- Tags
- Functions
- Creation timestamp
- Update timestamp

The supported source types currently include:

```text
DOCUMENT
LINK
```

The frontend has also been prepared for:

```text
UPLOAD
```

However, actual file storage and extraction are not implemented yet.

## Related data structures

The documentation system includes relationships for:

- Document tags
- Document-to-tag associations
- Sprint functions
- Document-to-function associations
- Sprint-to-document associations

## How it helps the workflow

- Creates a consistent structure for project knowledge.
- Allows documents to be discovered independently of a specific sprint.
- Supports future search, filtering, AI retrieval, and document classification.

---

# 6. Document Creation API

## Intent

- The user wants to create documentation from the application rather than inserting records manually into the database.
- The API should validate document information and associate documents with the correct sprint when applicable.

## Outcome

- Documents can be created through the `/api/documents` endpoint.
- The API supports form-based submission from the frontend.
- Documents are returned after successful creation and immediately displayed in the UI.

## Current solution

The API supports:

- Document title
- Document type
- Source type
- Manual document content
- External URL
- Optional sprint ID
- Comma-separated tags

The document creation helper validates:

- Title is required.
- Document type is required.
- Content is required for manual documents.
- URL is required for link-based documents.
- The selected sprint must exist when a sprint ID is provided.
- Tags are normalized and deduplicated.

Other API behavior:

- A missing file for an upload document returns 400.
- The `UPLOAD` source type returns 501 with the message that file storage and document extraction are not implemented yet.
- (Updated) Validation errors from the creation helper (for example a missing title) currently come back as a 500 with the generic message "Failed to process document." instead of a 400 with the specific message.

## Tag handling

Tags are:

- Trimmed
- Converted to lowercase
- Filtered for empty values
- Deduplicated
- Created or reused through database upsert logic

## How it helps the workflow

- Standardizes document creation.
- Prevents incomplete document records.
- Makes documents easier to categorize and retrieve.
- Allows documentation to be associated with a specific sprint when needed.

---

# 7. Sprint-Level Documentation Section

## Intent

- The user wants to view documentation relevant to a particular sprint directly from the sprint detail page.
- Users should be able to add and review documents without leaving the sprint workspace.

## Outcome

- A Documentation section was added to the sprint detail page.
- The section displays documents associated with the current sprint.
- Users can open an Add Document modal from the sprint page; documents added there are attached to that sprint automatically.

## Current solution

The sprint detail page includes:

- Documentation heading
- Document count
- Add Document button
- Document cards
- Document source type indicator
- Document content or external link
- Document tags
- Empty state when no documents exist

The page fetches sprint-specific documents using:

```text
/api/documents?sprintId={sprintId}
```

## How it helps the workflow

- Keeps sprint-related knowledge close to sprint execution.
- Reduces context switching.
- Makes requirements, notes, references, and other sprint materials easier to access.

## Assumptions and limitations

- The sprint page currently focuses on displaying documents associated with that sprint.
- Centralized documentation management is now available through a separate page.

---

# 8. Central Documentation Page

## Intent

- The user wants one dedicated location where all documentation is visible.
- Documentation should not be limited to the sprint in which it was created.

## Outcome

- A new Documentation page was created at:

  ```text
  /documentation
  ```

- The page fetches and displays all documents.
- The page includes a dedicated header and Add Document action.

## Current solution

The central Documentation page includes:

- Documentation page heading
- Description
- Add Document button
- All Documents section
- Dynamic document count
- Loading state
- Empty state
- Document cards displayed in a responsive grid

The page fetches all documents using:

```text
GET /api/documents
```

## Document card information

Each card can display:

- Document title
- Document type
- Source type
- Manual content preview
- External URL
- Tags
- Creation date (shown as, for example, 29 Sep 2026)
- Associated sprint name, when applicable

## How it helps the workflow

- Provides a single knowledge hub for the Internal Management System.
- Makes general and sprint-specific documentation accessible from one place.
- Establishes a foundation for future search, filtering, and document management features.

---

# 9. Add Document Modal

## Intent

- The user wants to create documentation through a popup instead of expanding a large form inside the page.
- The form should be accessible from both sprint-level and central documentation contexts.

## Outcome

- An Add Document modal was implemented.
- The modal opens from the Add Document button.
- The modal can be closed using the Cancel action, the close icon, or the Escape key.
- (Updated) The modal is one shared component, `src/components/documents/AddDocumentModal.tsx`, used by both the Documentation page and the sprint page.

## Current solution

The modal contains fields for:

- Document title
- Document type
- Source type
- Content or URL depending on source type
- Tags
- Sprint association (a dropdown on the Documentation page; fixed to the current sprint on the sprint page)

The source type selector currently supports:

```text
Document Content
External Link
Upload Document
```

## Form behavior

### Document Content

Displays a textarea for manually entered content.

### External Link

Displays a URL input for external documentation.

### Upload Document

Displays a file picker for supported document formats.

The frontend currently accepts:

```text
.pdf
.doc
.docx
.txt
.md
```

## How it helps the workflow

- Keeps the page visually clean.
- Provides a focused document creation experience.
- Allows the same document creation concept to be used from multiple locations.
- Makes the source type explicit before submission.

Errors (such as a missing file or a failed save) appear inline inside the modal. The form starts empty every time it is opened, and labels are linked to their fields.

---

# 10. General Documentation and Sprint Association

## Intent

- The user wants to decide whether a document belongs to a specific sprint or should remain general documentation.
- Documentation should not be forced into a sprint when it is relevant to the wider project.

## Outcome

- The Add Document modal on the Documentation page includes an optional sprint selector.
- Users can select a sprint or keep the default General Documentation option.
- On the sprint page there is no selector, because the document belongs to that sprint.

## Current solution

The sprint selector includes:

```text
General Documentation
```

followed by available sprints fetched from:

```text
/api/sprints
```

When a sprint is selected:

- The sprint ID is included in the form submission.
- The document is associated with that sprint.

When General Documentation is selected:

- No sprint ID is submitted.
- The document remains independent of a sprint.

## How it helps the workflow

- Supports both project-wide and sprint-specific knowledge.
- Prevents unnecessary duplication of general documentation.
- Makes documentation ownership and context clearer.

---

# 11. Documentation Display and Sprint Labels

## Intent

- The user wants to understand the context of each document while browsing all documentation.
- Documents associated with a sprint should clearly show that relationship.

## Outcome

- Document cards display the associated sprint name when one exists.
- General documentation does not display a sprint label.

## Current solution

A sprint label is displayed in the format:

```text
Sprint: {sprint name}
```

The related sprint is loaded through the document query's sprint relationship.

## How it helps the workflow

- Gives users immediate context without opening the document.
- Makes it easier to distinguish general documentation from sprint-specific material.
- Supports future filtering by sprint.

---

# 12. Current Supported Documentation Flows

| Flow | Status |
|---|---|
| Create manual document content | Completed and verified |
| Create external link document | Completed and verified |
| View sprint-specific documents | Completed and verified |
| View all documents centrally | Completed and verified |
| Add document through popup modal | Completed and verified |
| Add tags to documents | Completed and verified |
| Associate document with a sprint | Completed and verified |
| Keep document as general documentation | Completed and verified |
| Display associated sprint name | Completed and verified |
| Select a file for upload | Frontend implemented (saving shows the "not implemented yet" message) |
| Store uploaded files | Not implemented |
| Extract uploaded document text | Not implemented |
| Search documentation | Deferred |
| Filter documentation | Deferred |

---

# 13. Deferred and Future Scope

The following items were intentionally left for later implementation.

## Documentation search

Potential search fields:

- Document title
- Document type
- Tags
- Sprint name
- Document content

## Documentation filters

Potential filters:

- Source type
- Document type
- Sprint
- Tags
- Creation date

## File storage

Potential initial local-development location:

```text
public/uploads/documents/
```

The database could store:

- Original filename
- Stored file path
- MIME type
- File size
- Extracted text

## Document preview and detail view

Future functionality may include:

- Full document view
- Markdown rendering
- PDF preview
- External link preview
- Download action
- Edit and delete actions

## AI-powered documentation

Potential future functionality:

- Automatic document summarization
- Tag generation
- Document classification
- Requirement extraction
- Linking documents to sprint functions
- Semantic search using embeddings
- AI-generated documentation from sprint activity

---

# 14. Verification Summary

The following functionality was tested successfully during implementation:

- Sprint creation and saved sprint visibility
- AI response parsing after fenced JSON cleanup
- Sprint function persistence
- Readable task dependency display
- Assignee recommendation and assignment flow
- Sprint-specific document fetching
- Central Documentation page loading
- Manual document creation
- External link creation
- Add Document popup modal
- Optional sprint association
- General Documentation creation
- Display of associated sprint names

(Updated) The shared modal, inline error messages, Escape-to-close and the single date format were added after this testing round. They passed a TypeScript check but have not been re-tested in the running application.

The Upload Document option currently reaches the intended temporary limitation message because file storage and document extraction have not yet been implemented.

---

# 15. Other functionality added since (updated)

These items are outside the documentation feature but are part of the current application.

- **Daily tasklist page (`/tasklist`).** Each team member has a tasklist per day with tasks and subtasks (category, priority, estimate, status), edit and delete, a planned-versus-available capacity check, and start-of-day and end-of-day snapshots. (Updated 30 September) Each person opens their own tasklist and can create today's from the page; the Scrum Master can pick another member's tasklist, read only. After end of day is captured the tasklist is locked. The page is built from components in `src/components/tasklist/`.
- **Carry forward API.** Tasks can be carried into another tasklist through the tasklist API; a locked target tasklist returns 409. (Updated 30 September) Only tasks from your own tasklists can be carried. (Updated 1 October) The tasklist page now has a **Carry Over Unfinished** button; see section 17.
- **Team page (`/team-members`).** Lists team members and their skills. (Updated 30 September) The Scrum Master adds, deactivates and reactivates members and resets passwords here, and each member has a profile page. See section 16.
- **Shared look and feel.** All pages use the shared classes and colour tokens in `src/app/globals.css`, one date format (`src/lib/format-date.ts`), and inline messages instead of browser alert popups.

---

# 16. Sign-in, Roles and Permissions (added 30 September 2026)

## Intent

The tool had no sign-in: anyone who could open it could plan sprints (paid AI calls), remove team members or change anyone's tasklist. The Scrum Master needed to run the sprint and the team, while each member works on their own tasklist, tasks and documents.

## Outcome

Everyone signs in with an email and a password and has one of two roles, **Scrum Master** or **Member**. Every API route checks the role and ownership, and every screen shows only the actions the person can use.

## Current solution

- **Sign-in** with a signed session cookie. The member is read again from the database on every request, so deactivating someone takes effect at once.
- **Team management** (Scrum Master): add members with a temporary password, deactivate and reactivate them, reset passwords. A member with no history can be deleted.
- **Profile page** (`/team-members/[id]`): members edit their own name and skills; the Scrum Master edits anyone.
- **Sprints** (Scrum Master): edit name, goal and dates; end a sprint (unfinished tasks stay recorded in it); several sprints can be active at once, with an Overtime badge on active sprints past their end date.
- **Sprint tasks**: only the Scrum Master assigns; a member changes the status of tasks assigned to them.
- **Documentation**: anyone adds; the author or the Scrum Master edits and deletes. Links must be `http://` or `https://`. Documents added before sign-in have no author, so only the Scrum Master can change them.
- **Not allowed page** for Members who open Plan Sprint by its URL.

The full rules, the API reference and the known limitations are in `_docs_/PLAN/SUB-PHASES/PHASE-7.md`.

## How it helps the workflow

- Paid AI planning and team changes stay with the Scrum Master.
- Members see a simpler screen with only what they can do.
- History is kept: members are deactivated rather than deleted, and ended sprints are read only.

## Assumptions and limitations

- The first Scrum Master is created with `npm run create-admin` (see `README.md`).
- There is no email sending: temporary passwords are passed on by hand.
- Resetting a password does not sign the member out of browsers where they are already signed in; deactivating does.
- Checked with automated requests for each role (signed out, Member, Scrum Master, deactivated member). A click-through in the browser is still to be done.

---

# 17. Functions, Linked Daily Work and Time Spent (Phase 8 steps 1 to 4, added 1 October 2026)

## Intent

Sprints, sprint tasks and daily tasklists did not talk to each other. A daily task was free text, so nobody could say how far a feature had got, how long work actually took, or which daily work belonged to which sprint task. The senior team also asked for a weight per function, so that big features count for more.

## Outcome

Every sprint task belongs to a function (feature) and has a work type. Daily tasks can be linked to the sprint task they work on, and the time actually spent is recorded at End Day. This is the groundwork for progress, delay status and the 25 / 50 / 75 % marks (Phase 8 part B), and it gives the Daily Sprint Diary its totals.

## Current solution

- **Planning**: the AI returns a function and a work type (Development, Documentation, Testing, Research, Deployment) for every task, plus one documentation task per function. The Plan Sprint preview groups tasks by function and shows each function's weight (its share of the estimated hours). Nothing is saved until the Scrum Master removes any tasks they do not want and clicks **Save Sprint**.
- **Sprint page**: tasks grouped by function with hours and weight; the Scrum Master sets a task's function and work type (for sprints planned earlier, or to correct the AI).
- **Tasklist**: an optional **Sprint task** picker (only the person's own open sprint tasks in active sprints) fills in the title, work type and an estimate (the time left, no more than the day's available hours). Linked tasks show a `Feature · TASK-003` badge, and the list can be grouped by feature. Work outside the sprint can have a total estimate across days. **Carry Over Unfinished** copies the previous list's unfinished tasks, keeping the link and the total estimate.
- **End Day** asks for the time spent on each task and, for linked tasks, whether the whole sprint task is finished. Logged time moves a To Do sprint task to In Progress; "finished" marks it Done. Everything is saved in one request with the End Day snapshot.
- **Reopen**: the Scrum Master can move a Done sprint task back to In Progress.

## How it helps the workflow

- Function weights come from the estimates, so a big feature counts more without a separate guess.
- Daily work is tied to the sprint without retyping, and the time spent shows where estimates were wrong.
- Sprint task status follows the daily work, so the sprint page stays up to date.

## Assumptions and limitations

- The link, the total estimate and time spent are on main tasks only; subtasks follow their parent.
- If a sprint has ended or a task was reassigned by End Day, the time is kept and only the status change is skipped, with a note.
- Progress, delay status and the 25 / 50 / 75 % marks are not built yet (Phase 8 part B). The plan is `_docs_/PLAN/SUB-PHASES/PHASE-8.md`.
- Checked with automated requests for each role and the planning steps with one real AI run.

---

# 18. Daily Sprint Diary and Time Off (added 3 October 2026)

## Intent

Every working day the Scrum Master posts a Sprint Diary in Google Chat. Most of the work was collecting and retyping each person's Yesterday and Today from their tasklists, which made the diary slow and sometimes incomplete.

## Outcome

The Scrum Master writes only the header; the app generates the rest from the tasklists, the sprint links and the time-off records, in the format the team already posts. The diary is copied to Google Chat in one click and the exact posted text is kept.

## Current solution

- **Time off** (Team page, Scrum Master): public holidays and leave, one entry per person, added for several people at once. Upcoming entries are listed and can be removed.
- **Sprint Diary page** (`/sprint-diary`, Scrum Master): pick a date; the header (phase, macro scope, micro scope, status RED / ORANGE / GREEN) starts as a copy of the previous diary. The live preview adds overtime sprints, each active member's Yesterday (their latest earlier tasklist; Monday shows `Friday`) and Today (or `[To be updated]`, or `[Leave]`), task lines with `[spent / estimate]` totals across days, and upcoming time off.
- **Copy for Google Chat** copies the preview; **Publish** keeps that exact text with the date and who published it. A published diary cannot be changed. Past diaries are listed on the page.
- Members get the Not allowed page; the diary and time-off APIs are Scrum Master only.

The design, how the totals are worked out, and a comparison with the posted diaries are in `_docs_/PLAN/DAILY_SPRINT_DIARY_DESIGN.md` (section 7).

## How it helps the workflow

- The slow part of the diary (collecting everyone's work) is done by the app, so the diary is complete and on time.
- Totals such as `[35hr/48hr]` come from logged time instead of being worked out by hand, so overruns are visible.
- Upcoming holidays and leave are recorded once and listed automatically; Phase 10 (capacity) will use the same records.

## Assumptions and limitations

- The totals are only as good as the linking and the time entered at End Day.
- The header is text; structured milestones with slipped dates wait for Phase 8 part B.
- Subtasks show their planned time only; time is logged on main tasks.
- Checked with automated requests for each role, a run in a headless browser (load, live preview, save, copy, publish), and three person-days rebuilt from the posted diaries, whose lines and totals match.

---

# Where this leaves us

The Internal Management System now has a functional foundation for sprint planning, task execution support, assignee recommendations, and centralized documentation, with sign-in and Scrum Master / Member roles across all of it. (Updated 3 October) Daily work is linked to sprint tasks with the time spent, and the Daily Sprint Diary is generated from it; progress and delay tracking (Phase 8 part B) come next.

The Documentation feature currently supports both:

- **Sprint-specific documentation**
- **General project documentation**

Manual content and external links are working end-to-end. File selection is available in the UI, while actual file storage and text extraction remain future work.

Search and filtering were intentionally deferred and can be implemented after the core documentation workflow is finalized.
