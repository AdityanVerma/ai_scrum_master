# AI Instructions: Generate Flowchart Documentation in Markdown

## 1. Purpose

Create a clear, readable, and implementation-grounded flowchart document
in **Markdown (`.md`)**.

The generated Markdown will later be used as the reference for creating
a **pictorial flowchart**. Therefore, the document must describe the
flow precisely enough that another person or AI can convert it into a
visual diagram without needing to guess the sequence, decisions,
responsibilities, or connections.

The flowchart must be based on:

1.  The user's **Decision List**.
2.  The existing **codebase**.
3.  The actual implemented workflow, system behavior, and user
    interactions.

Do not invent features, steps, roles, validations, or system behavior
that are not supported by the Decision List or codebase.

------------------------------------------------------------------------

## 2. Core Principles

### 2.1 Follow the Decision List

Use the Decision List as the primary source for understanding:

-   What decisions users or administrators make.
-   What options are available.
-   What conditions affect the workflow.
-   What happens when a decision is accepted, rejected, or changed.
-   Where the process starts, branches, loops, and ends.

### 2.2 Verify Against the Codebase

Use the codebase to confirm:

-   Actual implementation.
-   Existing pages, components, APIs, services, and database operations.
-   User roles and permissions.
-   System-generated actions.
-   AI-generated actions.
-   Validation and error-handling behavior.
-   Navigation between screens or modules.
-   Whether a step is implemented, partially implemented, or only
    planned.

If the Decision List and codebase differ:

-   Reflect the implemented behavior when documenting the current
    system.
-   Clearly mention important discrepancies in an **Implementation
    Notes** section.
-   Do not silently assume that an unimplemented decision is already
    available.

### 2.3 Make the Flow Understandable to Newcomers

The document must be understandable to someone who:

-   Has never seen the feature before.
-   Does not know the internal codebase.
-   Needs to understand who performs each action.
-   Needs to understand why a decision or transition occurs.

Use short explanations where needed, but avoid unnecessary technical
detail inside the main flow.

------------------------------------------------------------------------


---

## 3. Mandatory Workflow Decomposition into Sub-Flowcharts

### 3.1 Do Not Force a Complex Workflow into One Flowchart

A complete feature or business process may be too large to represent clearly in a single pictorial flowchart.

When the workflow is complex, **divide it into multiple connected sub-flowcharts** based on logical stages, responsibilities, or major milestones.

The goal is to preserve readability and understanding—not to fit the entire process onto one page.

### 3.2 How to Identify Sub-Flowcharts

Before documenting the flow, analyze the complete workflow and divide it into meaningful stages, such as:

- Requirement collection.
- Information validation.
- AI analysis or planning.
- User review.
- Management approval.
- Execution.
- Monitoring.
- Completion.
- Reporting or handover.

Create separate sub-flowcharts when:

- A stage contains too many steps or branches.
- The stage has a distinct business purpose.
- Different actors become responsible for the process.
- The process moves from planning to execution.
- The flow contains a large AI-processing section.
- The diagram would become difficult to read on one page.
- A stage can be understood independently while still connecting to another stage.

### 3.3 Plan the Flowchart Structure First

Before writing individual flowchart documents:

1. Understand the complete workflow from the Decision List and codebase.
2. Identify the major stages.
3. Decide which stages require separate sub-flowcharts.
4. Assign a unique flowchart number to each sub-flowchart.
5. Define the sequence and connections between them.
6. Then generate the detailed Markdown document for each sub-flowchart.

### 3.4 Create a Flowchart Map

When multiple sub-flowcharts are required, include a high-level map before the detailed flows.

Use this format:

```markdown
## Flowchart Map

| Flow No. | Flowchart Title | Purpose | Entry From | Continues To |
|---|---|---|---|---|
| 00 | [Title] | [Purpose] | Start | Flow 01 |
| 01 | [Title] | [Purpose] | Flow 00 | Flow 02 |
| 02 | [Title] | [Purpose] | Flow 01 | Flow 03 |
| 03 | [Title] | [Purpose] | Flow 02 | End |
```

The map should help a newcomer understand the overall process before opening an individual sub-flowchart.

### 3.5 Sub-Flowchart Requirements

Every sub-flowchart must have:

- Its own unique flow number.
- Its own title and subtitle.
- A clear starting point.
- A clear ending point or continuation reference.
- A description of what is covered within the sub-flow.
- A reference to the previous flow, if applicable.
- A reference to the next flow, if applicable.
- Black reference stars for transitions to other flowcharts.
- The green star showing the current flowchart number.

### 3.6 Keep Each Sub-Flowchart Focused

Each sub-flowchart should focus on one logical area.

Do not place unrelated stages into the same diagram merely because they belong to the same feature.

For example, a large sprint-management workflow may be organized as:

| Flowchart | Sub-Flow |
|---|---|
| 00 | Sprint Requirement Collection |
| 01 | AI Task Breakdown and Skill Identification |
| 02 | Dependency and Context Analysis |
| 03 | Management Review and Approval |
| 04 | Sprint Execution |
| 05 | Sprint Completion |

These are illustrative organizational examples only. The actual divisions must be based on the user's Decision List and the codebase.

### 3.7 Cross-Flow References

When a process continues into another sub-flowchart:

- End the current flow with a black reference star.
- Include the destination flowchart number.
- State the transition condition or reason.
- Do not duplicate the next flowchart's detailed steps.

Example:

```markdown
### Flow Exit

- **Visual:** Black Reference Star
- **Reference:** Continue to Flowchart 03
- **Condition:** Management approves the sprint proposal.
```

### 3.8 Avoid Excessive Fragmentation

Do not split every individual action into a separate flowchart.

Create a new sub-flowchart only when the separation improves:

- Readability.
- Logical organization.
- Ownership clarity.
- Navigation between stages.
- Understanding for newcomers.
- Ability to create a clean pictorial diagram.

The final set of flowcharts should be **modular but not unnecessarily fragmented**.


## 3. Required Flowchart Color Scheme

Use the following visual conventions consistently throughout the
Markdown documentation and any later pictorial flowchart.

  -----------------------------------------------------------------------
  Color / Visual Style    Meaning                 Use For
  ----------------------- ----------------------- -----------------------
  **Yellow Boxes**        User Decisions / User   Actions performed by a
                          Actions                 user, admin, manager,
                                                  mentor, or other human
                                                  role

  **Gray Boxes**          System Working          Normal system
                                                  processing,
                                                  validations, data
                                                  retrieval, saving,
                                                  updating, or automatic
                                                  operations

  **Orange Diamond        Decision Points         Questions that produce
  Boxes**                                         different paths, such
                                                  as Yes/No or multiple
                                                  choices

  **Green Background**    AI Work                 Any task performed by
                                                  an AI agent, AI
                                                  service, or AI-assisted
                                                  process

  **Black Star / Black    Reference to Another    Connection to a
  Reference Marker**      Flow                    different flowchart or
                                                  continuation of the
                                                  process

  **Green Star**          Current Flowchart       Identifier of the
                          Number                  current flowchart
  -----------------------------------------------------------------------

### Color Rules

-   Do not use yellow to represent system processing.
-   Do not use gray to represent a human decision.
-   Do not use orange diamonds for ordinary actions.
-   Use the green AI background only when AI is actively performing
    work.
-   If AI is involved in a step performed alongside the system, make the
    AI responsibility explicit.
-   Keep the color meaning consistent across all flowcharts in the
    project.

------------------------------------------------------------------------

## 4. Flowchart Numbering

Every flowchart must have a unique identifier.

### 4.1 Number Format

Use numeric identifiers by default:

-   `00`
-   `01`
-   `02`
-   `03`

Use alphabetic suffixes only when a flow needs subdivisions:

-   `1a`
-   `1b`
-   `2`
-   `3a`
-   `3b`
-   `3c`

### 4.2 Current Flowchart Marker

At the top of the flowchart documentation, specify:

-   The current flowchart number.
-   The flowchart title.
-   The flowchart subtitle.
-   The previous flow reference, if applicable.
-   The next flow reference, if applicable.

The visual version should represent the current flowchart number using a
**green star**.

When the flow connects to another flowchart, use a **black
star/reference marker** containing the referenced flowchart number.

Example:

-   Green star `01` = current flowchart.
-   Black star `02` = continue to Flowchart 02.

------------------------------------------------------------------------

## 5. Required Heading Structure

Every flowchart Markdown document must begin with a clear heading
section.

Use this structure:

``` markdown
# Flowchart [NUMBER]: [FLOWCHART TITLE]

## Subtitle

[Short description of the flow, written as:
Starting Point → Main Outcome]

## Flowchart Reference

- Current Flow: [NUMBER]
- Previous Flow: [NUMBER or None]
- Next Flow: [NUMBER or None]
- Related Feature/Module: [Feature or Module Name]
```

### Heading Guidelines

-   The title should describe the complete flow.
-   The subtitle should summarize the process in a short format.
-   Avoid vague titles such as `Process Flow` or `Feature Flow`.
-   Prefer titles such as:
    -   `Profile Creation & Information Collection`
    -   `Sprint Requirement & AI Planning`
    -   `Management Approval & Sprint Execution`

------------------------------------------------------------------------

## 6. Optional Instructions / Context Box

Add an **Instructions / Context** section when it would help a newcomer
understand the flow before reading it.

Use this section when:

-   The workflow contains unfamiliar terminology.
-   Multiple user roles are involved.
-   A prerequisite must be completed first.
-   The flow depends on another module.
-   The AI's responsibility needs explanation.
-   A business rule is important for interpreting the diagram.

Suggested format:

``` markdown
> **Instructions / Context**
>
> - Explain important terminology.
> - Mention prerequisites.
> - Identify the primary user role.
> - Explain any important business rule.
> - Clarify what the AI does and does not do.
```

Do not add this section merely for decoration. Include it only when it
improves understanding.

------------------------------------------------------------------------

## 7. Flowchart Documentation Structure

Use the following overall structure:

``` markdown
# Flowchart [NUMBER]: [Title]

## Subtitle

## Flowchart Reference

## Instructions / Context
(Optional)

## Actors and Responsibilities

## Legend

## Main Flow

## Decision Details

## Alternate and Exception Flows

## AI Responsibilities
(Optional, when AI is involved)

## System and Codebase References

## Implementation Notes
(Optional, when needed)
```

------------------------------------------------------------------------

## 8. Actors and Responsibilities

Before describing the main flow, identify the roles involved.

Example:

  Actor      Responsibility
  ---------- -----------------------------------------------------------
  User       Provides information and makes decisions
  Admin      Reviews, approves, or modifies the process
  System     Validates, stores, retrieves, and updates data
  AI Agent   Breaks down work, identifies skills, or performs analysis

Only include actors that are actually involved in the feature.

Clearly distinguish:

-   Human actions.
-   System actions.
-   AI actions.

------------------------------------------------------------------------

## 9. Legend

Every flowchart document should include a concise legend.

Example:

  Visual Element          Meaning
  ----------------------- ------------------------------
  🟨 Yellow rounded box   User action or user decision
  ⬜ Gray rounded box     System processing
  🟧 Orange diamond       Decision / condition
  🟩 Green background     AI processing
  ★ Black star            Reference to another flow
  ★ Green star            Current flowchart number

The symbols above are textual representations for Markdown
documentation. The later pictorial flowchart should use the actual
corresponding colors and shapes.

------------------------------------------------------------------------

## 10. Main Flow Documentation

Document the flow in the exact order in which it occurs.

Use numbered steps.

Each step should include:

1.  Step number.
2.  Actor responsible.
3.  Action or system operation.
4.  Visual shape/color.
5.  Next step or transition.

Use this format:

``` markdown
### Step 1: [Short Step Name]

- **Actor:** User / System / AI
- **Visual:** Yellow Box / Gray Box / Orange Diamond / Green AI Section
- **Action:** [What happens]
- **Outcome:** [What this step produces]
- **Next:** [Next step or decision]
```

### Writing Rules for Steps

-   Keep step names short.
-   Use action-oriented language.
-   Use one meaningful action per step where possible.
-   Avoid combining unrelated operations into one box.
-   Do not write long paragraphs inside visual boxes.
-   Explain complex details below the step instead of overcrowding the
    box.

Prefer:

> `Provide sprint requirements`

Instead of:

> `The user provides all the necessary details regarding every possible requirement, feature, objective, and expected outcome for the upcoming sprint in the system.`

------------------------------------------------------------------------

## 11. Mapping Actions to Visual Shapes

Use the following rules when deciding the visual representation.

### 11.1 Yellow Box --- User Action

Use for actions such as:

-   Enter information.
-   Select an option.
-   Confirm a choice.
-   Submit a form.
-   Review a proposal.
-   Approve or reject something.
-   Modify a prompt.
-   Update a status manually.

Format:

``` markdown
**Visual:** Yellow Box  
**Label:** `[Short user action]`
```

### 11.2 Gray Box --- System Processing

Use for actions such as:

-   Validate input.
-   Retrieve data.
-   Save data.
-   Update database records.
-   Generate a system response.
-   Send a notification.
-   Load a page.
-   Apply permissions.
-   Calculate values without AI involvement.

Format:

``` markdown
**Visual:** Gray Box  
**Label:** `[Short system action]`
```

### 11.3 Orange Diamond --- Decision Point

Use when the flow asks a question or evaluates a condition.

Every decision must specify:

-   The exact question.
-   All possible outcomes.
-   The next step for each outcome.

Format:

``` markdown
**Visual:** Orange Diamond  
**Question:** `[Decision question]`

- **Yes:** → [Next step]
- **No:** → [Next step]
```

If there are more than two outcomes:

``` markdown
- **Option A:** → [Next step]
- **Option B:** → [Next step]
- **Option C:** → [Next step]
```

Never create a decision diamond without documenting its outgoing paths.

### 11.4 Green Background --- AI Work

Use for tasks where AI actively performs work, such as:

-   Analyze requirements.
-   Break a feature into smaller tasks.
-   Identify required skills.
-   Analyze dependencies.
-   Generate recommendations.
-   Determine context.
-   Recalculate affected tasks or assignments.
-   Generate content using an AI model.

Format:

``` markdown
**Visual:** Green AI Background  
**AI Action:** `[Short AI action]`  
**Input:** `[Information provided to AI]`  
**Output:** `[Result produced by AI]`
```

If multiple AI actions occur sequentially, place them inside one green
AI section or group them under a clearly labeled AI-processing area.

### 11.5 Black Star --- Reference to Another Flow

Use when the current process continues in another flowchart.

Format:

``` markdown
**Visual:** Black Reference Star  
**Reference:** Continue to Flowchart [NUMBER]
```

Do not duplicate the entire next flowchart unless explicitly requested.

------------------------------------------------------------------------

## 12. Connections and Transitions

Every step must have a clearly documented transition.

Use arrows such as:

-   `↓` for the next step.
-   `→` for a horizontal transition.
-   `Yes →`
-   `No →`
-   `Option A →`
-   `Continue to Flowchart 02 →`

For each transition, specify:

-   Source step.
-   Trigger or condition.
-   Destination step.
-   Whether the transition is normal, conditional, looping, or an
    exception.

Example:

``` markdown
### Transition T1

**From:** Step 3  
**Condition:** Required information is complete  
**To:** AI Planning Section  
**Type:** Conditional transition
```

------------------------------------------------------------------------

## 13. Loops and Rework

Explicitly document loops when a user must revise information or repeat
an action.

Examples:

-   User provides more information.
-   User modifies a prompt.
-   Validation fails.
-   Approval is rejected.
-   AI requests additional context.
-   A task is sent back for revision.

For every loop, explain:

1.  What causes the loop.
2.  Which step the flow returns to.
3.  What allows the flow to exit the loop.

Example:

``` markdown
### Rework Loop

- **Trigger:** Required information is insufficient.
- **Action:** System requests additional information.
- **User Action:** User provides more information.
- **Return:** Flow returns to the information sufficiency decision.
- **Exit Condition:** Sufficient information is available.
```

Do not hide loops in prose. They must be visible in the documented flow
and later pictorial diagram.

------------------------------------------------------------------------

## 14. Alternate and Exception Flows

Document meaningful alternate paths separately from the main flow.

Include cases such as:

-   User rejects a proposal.
-   User cancels the process.
-   Required information is missing.
-   Validation fails.
-   AI cannot complete analysis.
-   A required dependency is unavailable.
-   User lacks permission.
-   A system or API operation fails.

Use this format:

``` markdown
### Alternate Flow A1: [Name]

- **Trigger:** [What causes the alternate path]
- **Action:** [What happens]
- **Next Step:** [Where the flow goes]
- **End State:** [What the user or system sees]
```

Only include exceptions supported by the Decision List or codebase. If
an exception is not implemented but is important, mark it as a
recommendation or gap instead of presenting it as current behavior.

------------------------------------------------------------------------

## 15. AI-Specific Documentation

When AI is involved, clearly separate AI work from normal system work.

For every AI operation, document:

-   Why AI is invoked.
-   What input AI receives.
-   What AI produces.
-   Whether the output is shown to the user.
-   Whether the output is saved.
-   Whether the user can review or modify the result.
-   What happens if AI output is invalid or incomplete.
-   Whether another AI operation depends on the result.

Example:

``` markdown
### AI Processing: Task Breakdown

- **Purpose:** Convert a high-level requirement into smaller actionable tasks.
- **Input:** Approved sprint requirements.
- **AI Output:** Structured task breakdown.
- **System Action After AI:** Validate and store generated tasks.
- **User Interaction:** User reviews or modifies the result, if supported.
- **Failure Handling:** Document the actual implemented fallback or error behavior.
```

Do not label a normal API call as AI work unless an AI model or AI agent
is actually involved.

------------------------------------------------------------------------

## 16. Codebase References

Connect the documented flow to the relevant implementation.

Use a table such as:

  Flow Step   Code Reference               Purpose
  ----------- ---------------------------- -----------------------------
  Step 1      `path/to/component`          Captures user input
  Step 2      `path/to/api/route`          Validates or processes data
  Step 3      `path/to/ai/service`         Performs AI analysis
  Step 4      `path/to/database/service`   Saves the result

Include, where relevant:

-   Page or route.
-   Component.
-   API endpoint.
-   Service or utility.
-   AI prompt or orchestration file.
-   Database model.
-   Relevant state-management logic.

Do not include invented file paths. If the exact path cannot be
confirmed, write:

> `Code reference: To be verified`

------------------------------------------------------------------------

## 17. Decision Details

After the main flow, provide a compact decision table for all important
decision points.

Example:

  -----------------------------------------------------------------------
  Decision ID       Decision Question Possible Outcomes Result
  ----------------- ----------------- ----------------- -----------------
  D1                Is sufficient     Yes / No          Continue or
                    information                         request more
                    available?                          information

  D2                Does the user     Yes / No          Create sprint or
                    approve?                            revise proposal
  -----------------------------------------------------------------------

This section helps the person creating the pictorial flowchart ensure
that no branch is missed.

------------------------------------------------------------------------

## 18. Flowchart Readability Rules

The final Markdown must be easy to convert into a clean visual
flowchart.

### Follow These Rules

-   Use short labels for boxes.
-   Keep one action per visual box whenever practical.
-   Avoid paragraphs inside flowchart shapes.
-   Explain complex behavior below the diagram instructions.
-   Use consistent naming for the same action throughout the document.
-   Avoid unnecessary repetition.
-   Keep the main flow linear where possible.
-   Separate main flow, alternate flow, and exception flow.
-   Make every decision's outcomes explicit.
-   Make every reference to another flowchart explicit.
-   Avoid crossing connections where possible.
-   Avoid ambiguous words such as `process`, `handle`, or `manage`
    without explanation.
-   Use clear actor labels: User, Admin, System, AI Agent, etc.

### Recommended Box Label Length

Prefer labels of approximately:

-   2--8 words for ordinary actions.
-   5--12 words for decisions.
-   Short phrases rather than complete paragraphs.

------------------------------------------------------------------------

## 19. Suggested Markdown Representation of the Flow

Use a structured flow list that can be easily transformed into a
diagram.

Example format:

``` markdown
## Main Flow

### Start

- **Visual:** Green Star
- **Flow Number:** 01
- **Label:** Start of [Flow Name]

### Step 1

- **Actor:** User
- **Visual:** Yellow Box
- **Label:** Provide required information
- **Next:** Step 2

### Step 2

- **Actor:** System
- **Visual:** Gray Box
- **Label:** Validate submitted information
- **Next:** Decision D1

### Decision D1

- **Visual:** Orange Diamond
- **Question:** Is the information sufficient?
- **Yes:** → AI Section A
- **No:** → Step 3

### Step 3

- **Actor:** System
- **Visual:** Gray Box
- **Label:** Request additional information
- **Next:** Step 4

### Step 4

- **Actor:** User
- **Visual:** Yellow Box
- **Label:** Provide more information
- **Next:** Decision D1

### AI Section A

- **Actor:** AI Agent
- **Visual:** Green AI Background
- **Actions:**
  1. Break requirements into smaller tasks.
  2. Identify required skills.
  3. Analyze dependencies.
  4. Determine required context.
- **Next:** Black Reference Star → Flowchart 02
```

This is only a structural example. Do not reuse its feature-specific
data unless it is supported by the actual Decision List and codebase.

------------------------------------------------------------------------

## 20. Validation Checklist Before Finalizing

Before generating the Markdown file, verify the following:

### Source Accuracy

-   [ ] The flow is based on the Decision List.
-   [ ] The flow is checked against the codebase.
-   [ ] No unsupported functionality has been invented.
-   [ ] Current implementation and planned behavior are distinguished.

### Flow Completeness

-   [ ] The starting point is clear.
-   [ ] The ending point is clear.
-   [ ] All major user actions are included.
-   [ ] All major system operations are included.
-   [ ] All AI operations are included and grouped correctly.
-   [ ] Every decision has all possible outcomes.
-   [ ] Loops and rework paths are documented.
-   [ ] Important alternate and exception paths are documented.
-   [ ] References to other flowcharts are explicit.

### Visual Mapping

-   [ ] User actions use yellow boxes.
-   [ ] System actions use gray boxes.
-   [ ] Decisions use orange diamonds.
-   [ ] AI work uses a green background.
-   [ ] The current flow number uses a green star.
-   [ ] References to other flows use black stars.

### Readability

-   [ ] Headings and subtitles are clear.
-   [ ] Instructions/context are included when necessary.
-   [ ] Box labels are short and readable.
-   [ ] The document is understandable to a newcomer.
-   [ ] The flow can be converted into a pictorial diagram without
    guesswork.
-   [ ] The document avoids unnecessary technical or narrative detail.

------------------------------------------------------------------------

## 21. Final Output Requirements

Generate only a well-structured Markdown flowchart document unless
additional explanation is explicitly requested.

The final document must:

1.  Be easy to read.
2.  Be grounded in the Decision List and codebase.
3.  Clearly identify human, system, and AI responsibilities.
4.  Use the defined color and shape conventions.
5.  Include headings, subtitles, and flow references.
6.  Explain decisions and transitions precisely.
7.  Include loops, alternate paths, and references where applicable.
8.  Be suitable as a direct blueprint for creating a pictorial
    flowchart.

**Important:** The Markdown document is not the pictorial flowchart
itself. It is the authoritative textual specification from which the
pictorial flowchart will be created.
