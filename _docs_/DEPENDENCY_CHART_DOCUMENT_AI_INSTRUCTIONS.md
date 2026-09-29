# AI Instructions: Dependency Chart Document Generation

## 1. Purpose

Generate a structured **Dependency Chart Document** for a feature, functionality, workflow, module, or system integration.

The document must help AI agents, developers, testers, product owners, and reviewers understand:

- What the feature does.
- Who interacts with it.
- Which modules, functions, services, and UI components are involved.
- What changes are required.
- What the feature depends on.
- How the feature behaves in normal and failure scenarios.
- What validations and test cases are required.
- What risks, assumptions, and expected issues exist.

The output must be practical, implementation-oriented, and easy for AI to interpret.

---

## 2. Core Documentation Principles

### 2.1 Be Structured

Always use clear headings and predictable sections.

Use the same section order for every Dependency Chart Document unless a section is genuinely not applicable.

### 2.2 Be Specific

Avoid vague statements such as:

- "Update the UI."
- "Handle errors properly."
- "Integrate the backend."
- "Improve user experience."

Instead, explain:

- Which UI element changes.
- What event triggers the change.
- Which state is updated.
- Which API, function, or service is called.
- What happens when the operation succeeds or fails.

### 2.3 Be Implementation-Oriented

Describe behavior in terms of:

- Components.
- Functions.
- Hooks.
- APIs.
- Routes.
- Database entities.
- External services.
- Browser APIs.
- State variables.
- UI elements.
- Events.
- Validations.
- Error states.
- Retry mechanisms.

Do not write only high-level product descriptions.

### 2.4 Maintain Business and Technical Context

Every document should explain both:

1. The technical implementation and dependencies.
2. The impact on the user and business workflow.

### 2.5 Avoid Unnecessary Prose

Use concise labels, bullet points, and grouped subsections.

Do not write long narrative paragraphs when a list communicates the information more clearly.

### 2.6 Do Not Invent Unsupported Details

If specific technical information is unavailable:

- Do not fabricate function names, file names, API routes, database tables, services, or implementation details.
- Use a neutral description such as "Relevant frontend component" or "Applicable backend API."
- If clarification is necessary, identify the missing information under `Assumptions` or `Possible Validations Required`.

### 2.7 Preserve Important Details

Do not remove meaningful implementation details merely to shorten the document.

The document should be thorough enough for an AI agent to understand the feature's behavior, dependencies, edge cases, and expected outcomes.

---

## 3. Required Document Format

Use the following title format:

# Dependency Chart Document: [Feature or Module Name]

Then include:

- Date: [YYYY-MM-DD]
- Version: [Version Number]

Example:

```md
# Dependency Chart Document: Language Translation

Date: 2026-05-21
Version: 1.0
```

---

## 4. Required Section Order

Use the following section order:

1. `[Feature Name] – [User/Admin/Role]`
2. `Function`
3. `Responsible Team/Module`
4. `Trigger`
5. `Frontend Changes`
6. `Impact on User (Business Use Case)`
7. `Does User Know What To Do (Navigation)`
8. `Dependency On`
9. `Integration Aspects`
10. `Possible Validations Required`
11. `Possible Test Case Scenarios`
12. `Possible Worst Case Scenario`
13. `Expected Issues`
14. `Assumptions`

The sections may contain subsections and grouped bullet points.

If a section does not apply, retain the heading and write:

```md
Not applicable for this feature.
```

Do not silently remove required sections unless the user explicitly requests a shorter format.

---

## 5. Section-by-Section Instructions

## 5.1 Feature and User/Role Heading

Start with the feature name followed by the primary user role or roles.

Format:

```md
1. [Feature Name] – [User/Admin/Role]
```

Examples:

- `1. Language Translation – User/Admin`
- `1. Sprint Planning – Admin`
- `1. Profile Creation – User/Admin`
- `1. Poll Management – Admin`

Include all relevant roles if different roles interact with the feature.

---

## 5.2 Function

List the primary functions, hooks, utilities, services, classes, or modules involved.

Include:

- Function names.
- Hook names.
- Utility names.
- Service names.
- Relevant constants.
- Important handlers.

Example:

```md
Function: usePersistedLanguage, useGoogleTranslate, languages, LanguageSwitcher
```

If the exact names are unknown, describe the functional responsibilities instead of inventing names.

---

## 5.3 Responsible Team/Module

Identify the responsible ownership area.

Include relevant layers such as:

- Frontend.
- Backend.
- Database.
- Authentication and authorization.
- External service integration.
- Infrastructure.
- AI/ML module.
- Notification module.
- Localization module.

Example:

```md
Responsible Team/Module:
Frontend – Language Translation / Localization
External Service – Google Translate Widget
```

Use separate lines for different ownership areas.

---

## 5.4 Trigger

Describe exactly what starts the workflow.

Include:

- User actions.
- Page load.
- Component mount.
- API request.
- Scheduled event.
- Database event.
- Authentication event.
- External webhook.
- Retry action.

Use a chronological description where necessary.

Example:

```md
Trigger:
User opens Language Selector and then User selects preferred language from dropdown
```

If multiple triggers exist, list each trigger separately.

---

## 5.5 Frontend Changes

This section must describe all frontend behavior and UI changes.

Group related changes under meaningful subsections.

Possible subsections include:

- Component Changes
- User Interaction
- State Management
- API Interaction
- Loading State
- Success State
- Error State
- Retry Behavior
- Data Persistence
- Conditional Rendering
- Accessibility
- Responsive Behavior
- Navigation
- Validation
- Dynamic Content Updates

For each behavior, explain:

1. What the UI displays.
2. What action the user takes.
3. What state changes.
4. What function or service executes.
5. What happens after success.
6. What happens after failure.

Example structure:

```md
Frontend Changes:

Language Selector:
- Display supported languages from LANGUAGE_OPTIONS.
- Show currently selected language.
- Disable dropdown while translation is in progress.
- Display translation unavailable state if service fails.

On Language Selection:
- Capture selected language.
- Update active language state.
- Save selected language in localStorage.
- Trigger Google Translate language change event.
- Detect translation execution failures.
- Display error dialog when translation fails.

Retry Handling:
- Preserve the selected language after failure.
- Allow the user to retry without selecting the language again.
- Prevent multiple retry requests while a translation is already in progress.
```

Do not limit this section to visual changes. Include all frontend logic that affects the feature.

---

## 5.6 Impact on User (Business Use Case)

Explain how the feature affects users and business workflows.

Cover relevant points such as:

- User capability enabled.
- Workflow improvement.
- Accessibility.
- Productivity.
- Reduced manual effort.
- Better discoverability.
- Improved consistency.
- Increased transparency.
- Error recovery.
- Persistence across sessions.
- Role-specific benefits.

Separate different user roles when necessary.

Example:

```md
Impact on User (Business Use Case):

User:
- Can access platform content in preferred language.
- Language preference persists across sessions.
- Improves accessibility for multilingual users.
- Enables quick switching between supported regional languages.
```

Do not use exaggerated claims. Describe realistic outcomes.

---

## 5.7 Does User Know What To Do (Navigation)

Document the user's expected interaction flow.

Explain:

- Where the user begins.
- Which UI element they use.
- What action they take.
- What feedback they receive.
- What happens next.
- How they recover from failure.
- How they return to or repeat the workflow.

Use simple step-by-step bullets.

Example:

```md
Does User Know What To Do (Navigation):

- User opens the language selector.
- User selects a language from the dropdown.
- Selected language automatically applies to platform content.
- User can switch language again anytime.
- If translation fails, the user sees an error message and can select Retry.
```

This section should focus on user clarity, not internal implementation.

---

## 5.8 Dependency On

Identify every dependency required for the feature to work.

Group dependencies into categories.

Recommended categories:

### External Services

Examples:

- Google Translate Widget.
- Third-party APIs.
- Payment gateway.
- Email provider.
- AI model provider.

### External Scripts or URLs

Include exact URLs only when known and relevant.

### Frontend Components

List:

- Component files.
- Shared UI components.
- Hooks.
- Utilities.
- Constants.
- Providers.

### Backend APIs

List:

- API routes.
- Controllers.
- Services.
- Middleware.
- Authentication requirements.

### Database

List:

- Database tables or collections.
- Relevant entities.
- Relationships.
- Required indexes.
- Persistence requirements.

### Browser APIs

Examples:

- localStorage.
- sessionStorage.
- WebSocket.
- DOM APIs.
- Clipboard API.
- Notifications API.

### UI Components

Examples:

- Dropdown.
- Modal.
- Dialog.
- Table.
- Form.
- Loading spinner.
- Toast.
- Retry button.

### State Management

List all meaningful state variables or stores.

### Permissions and Roles

Mention:

- Required role.
- Authentication dependency.
- Authorization rules.
- Role-specific behavior.

Do not force irrelevant categories into the document. Include only applicable categories.

---

## 5.9 Integration Aspects

Describe how the feature integrates with the rest of the application.

Use the following subsections where applicable:

### Scalability

Explain:

- How the feature can support future additions.
- Whether new options can be added through configuration.
- Whether the implementation is reusable.
- Whether it can support additional users, pages, languages, workflows, or services.
- Whether the design minimizes duplication.

Do not claim unlimited scalability.

### Security

Include relevant concerns such as:

- Authentication.
- Authorization.
- Input validation.
- Data exposure.
- Sensitive information.
- API key protection.
- Client-side versus server-side responsibilities.
- Third-party data sharing.

Only include security concerns relevant to the feature.

### Performance

Consider:

- Initial loading time.
- API latency.
- External script loading.
- Repeated requests.
- Large datasets.
- Rendering performance.
- Caching.
- Debouncing or throttling.

### Reliability

Consider:

- External service failures.
- Network interruptions.
- Partial responses.
- Retry behavior.
- Recovery mechanisms.
- Fallback behavior.
- State consistency.

### Maintainability

Consider:

- Reusable components.
- Configuration-driven behavior.
- Separation of concerns.
- Clear error handling.
- Avoidance of hardcoded values.
- Ease of adding future functionality.

### Vulnerabilities

List technical weaknesses and dependency risks.

Examples:

- External service unavailability.
- Third-party script failure.
- DOM selector dependency.
- Unsupported mappings.
- Invalid user input.
- Data inconsistency.
- Race conditions.
- Unauthorized access.
- Rate limiting.
- Vendor lock-in.

Distinguish between confirmed vulnerabilities and potential risks.

---

## 5.10 Possible Validations Required

List validations needed to prevent invalid states and incorrect behavior.

Include relevant categories:

### Input Validation

- Required fields.
- Supported values.
- Valid formats.
- Null or empty values.
- Duplicate values.
- Length limits.
- Type validation.

### State Validation

- Prevent invalid state transitions.
- Prevent duplicate actions.
- Prevent actions during loading.
- Confirm required data is available.
- Ensure state remains consistent after failure.

### Service Validation

- Verify external service availability.
- Verify script or API initialization.
- Validate response format.
- Handle timeouts.
- Handle unsuccessful responses.

### Permission Validation

- Verify authentication.
- Verify user role.
- Verify access to the feature.
- Prevent unauthorized operations.

### Persistence Validation

- Verify data is saved correctly.
- Verify corrupted or missing stored values are handled.
- Verify restored state is valid.

### Error Recovery Validation

- Verify Retry works.
- Prevent multiple simultaneous retries.
- Preserve user input where appropriate.
- Verify fallback behavior.

Write validations as actionable checks.

Example:

```md
Possible Validations Required:

- Validate supported language codes.
- Prevent invalid or null language selection.
- Prevent repeated translation triggers during loading.
- Verify Google Translate script loads successfully.
- Verify Retry action triggers translation again.
- Prevent multiple Retry requests while translation is already in progress.
```

---

## 5.11 Possible Test Case Scenarios

List realistic scenarios that QA, developers, or AI agents can use to verify the feature.

Include positive, negative, edge, integration, persistence, and recovery scenarios where applicable.

Recommended categories:

### Positive Scenarios

- Verify the main workflow succeeds.
- Verify valid input is accepted.
- Verify expected UI changes occur.

### Persistence Scenarios

- Refresh the page.
- Reopen the application.
- Restore saved preferences.
- Verify saved data remains consistent.

### Negative Scenarios

- Invalid input.
- Missing data.
- Unsupported values.
- Failed API request.
- External service unavailable.

### UI and State Scenarios

- Loading state.
- Disabled controls.
- Empty state.
- Success state.
- Error state.
- Retry state.

### Permission Scenarios

- Authorized user.
- Unauthorized user.
- Different roles.

### Edge Cases

- Same value selected again.
- Rapid repeated clicks.
- Large input.
- Empty response.
- Timeout.
- Interrupted network.
- Corrupted local data.

### Integration Scenarios

- Verify frontend and backend interaction.
- Verify database persistence.
- Verify external service integration.
- Verify dependent modules continue to work.

Write each scenario as a verifiable statement.

Example:

```md
Possible Test Case Scenarios:

- Select supported language and verify UI translation.
- Refresh page and verify persisted language is restored.
- Select same language again and verify translation re-triggers.
- Disconnect internet and verify error handling state.
- Verify dropdown disables during translation process.
- Verify unsupported language does not break UI.
- Verify fallback to English works correctly.
- Force translation failure and verify Translation Failed dialog appears.
- Click Retry and verify translation process starts again.
- Verify dialog closes after successful retry.
- Verify selected language remains unchanged after failure.
```

Do not write vague test cases such as "Test the feature thoroughly."

---

## 5.12 Possible Worst Case Scenario

Describe realistic failure conditions that could severely affect the feature or user workflow.

Include:

- Critical external dependency failure.
- Data loss or corruption.
- Repeated API failure.
- Incorrect state persistence.
- Partial UI updates.
- Infinite retry loops.
- Unauthorized access.
- Failure that blocks the user from completing the workflow.
- Failure that affects related modules.

Use conditional language such as:

- "Could result in..."
- "May cause..."
- "If X fails, Y may happen..."

Do not exaggerate or invent catastrophic outcomes.

Example:

```md
Possible Worst Case Scenario:

- Google Translate service becomes unavailable, causing translation failure.
- Hidden translation dropdown cannot be detected, preventing translation.
- localStorage corruption causes incorrect language persistence.
- UI becomes partially translated due to external service inconsistency.
- Translation repeatedly fails despite retry attempts, preventing language change.
```

---

## 5.13 Expected Issues

Document foreseeable problems that may arise during implementation or usage.

Separate issues into categories when useful.

Recommended structure:

```md
Expected Issues:

Global:
- Issue affecting multiple pages, modules, or users.

Function-Specific:
- Issue directly related to the feature's implementation.

UI/UX:
- Layout, accessibility, responsiveness, or usability issues.

Integration:
- Issues involving APIs, databases, or external services.

Performance:
- Latency, rendering, or resource-related issues.
```

Distinguish expected limitations from actual defects.

Examples:

- External service latency.
- Inconsistent third-party responses.
- Longer translated text affecting layout.
- Browser compatibility differences.
- Retry not resolving an ongoing provider outage.
- Race conditions caused by rapid user actions.

---

## 5.14 Assumptions

List the conditions assumed to be true for the feature to operate as documented.

Examples:

- Default language is English.
- Browser supports localStorage.
- Internet connection is available.
- External service remains accessible.
- User has access to the feature.
- Required permissions are configured.
- Relevant API is available.
- Required database schema exists.
- Failure can be detected by application logic.
- Retry functionality reuses the previously selected value.

Assumptions must be explicit.

Do not present assumptions as confirmed facts unless they are verified.

---

## 6. Writing and Formatting Rules

### 6.1 Use Markdown

The output must be a valid `.md` document.

Use:

- Markdown headings.
- Numbered sections.
- Bullet points.
- Nested bullet points.
- Code formatting for function names, file names, routes, constants, selectors, and technical identifiers.

### 6.2 Maintain Consistent Naming

Use consistent names throughout the document.

If a component is called `LanguageSwitcher.tsx`, do not later refer to it as `Language Selector Component` unless both terms are intentionally defined.

### 6.3 Use Technical Identifiers Precisely

Format technical identifiers using backticks:

- `usePersistedLanguage`
- `LanguageSwitcher.tsx`
- `localStorage`
- `preferred-language`
- `.goog-te-combo`
- `/api/v1/users`

### 6.4 Use Action-Oriented Language

Prefer:

- "Validate supported language codes."
- "Disable the dropdown during translation."
- "Persist the selected language in localStorage."
- "Display an error dialog when translation fails."

Avoid:

- "The system should be good."
- "The UI will work properly."
- "Handle everything accordingly."

### 6.5 Avoid Repetition

Do not repeat the same detail in every section.

However, repeat a dependency or behavior when it is necessary to explain a different aspect, such as:

- Implementation dependency.
- Validation requirement.
- Test scenario.
- Worst-case impact.

### 6.6 Preserve Hierarchy

Use nested bullets to group related items.

Example:

```md
Frontend Changes:

Language Selector:
- Display supported languages.
- Show active language.

On Language Selection:
- Capture selected value.
- Update state.
- Trigger translation.
```

### 6.7 Do Not Add Unrequested Sections

Do not add unrelated sections such as:

- Executive Summary.
- Conclusion.
- Recommendations.
- Priority Ranking.
- Overall Assessment.

Unless the user explicitly requests them.

---

## 7. Information Extraction Instructions

When source material is provided, extract information from it systematically.

Identify:

1. Feature name.
2. User roles.
3. Triggering events.
4. Functions and components.
5. Frontend behavior.
6. Backend behavior.
7. Database dependencies.
8. External services.
9. State management.
10. User navigation.
11. Business impact.
12. Validations.
13. Test scenarios.
14. Worst-case failures.
15. Expected issues.
16. Assumptions.

If source material contains scattered information, reorganize it into the required sections without changing its meaning.

If the source contains conflicting information:

- Do not silently choose one version.
- Mention the conflict under `Assumptions`, `Expected Issues`, or an appropriate section.
- Preserve the uncertainty clearly.

---

## 8. Handling Missing Information

When details are missing:

### If the detail is not essential

Use a general but accurate description.

Example:

```md
Dependency On:

Frontend Components:
- Relevant language selection component.
```

### If the detail is essential

Mention it as an assumption or validation requirement.

Example:

```md
Assumptions:
- Exact API endpoint is to be confirmed during implementation.
```

### Never

- Invent file paths.
- Invent API routes.
- Invent database fields.
- Invent service behavior.
- Invent error codes.
- Invent permissions.
- Invent performance metrics.
- Invent completed implementation work.

---

## 9. AI Interpretation Guidelines

The generated document should allow an AI agent to answer the following questions without needing to infer missing context:

### Feature Understanding

- What feature is being documented?
- Who uses it?
- What business problem does it address?

### Workflow Understanding

- What starts the feature?
- What steps does the user perform?
- What happens after each action?
- What happens when the action fails?

### Implementation Understanding

- Which components and functions are involved?
- Which states are required?
- Which services and APIs are called?
- What data is stored or retrieved?

### Dependency Understanding

- Which internal modules are required?
- Which external services are required?
- Which browser or infrastructure APIs are required?
- What happens if a dependency fails?

### Quality Understanding

- What validations are needed?
- What test cases should be executed?
- What edge cases exist?
- What issues are expected?

### Assumption Understanding

- Which facts are confirmed?
- Which behaviors depend on assumptions?
- Which details require further verification?

---

## 10. Quality Checklist Before Finalizing

Before generating the final document, verify the following:

### Structure

- [ ] Title includes the feature name.
- [ ] Date and version are present.
- [ ] Required sections appear in the expected order.
- [ ] Markdown formatting is valid.

### Feature Description

- [ ] User roles are identified.
- [ ] Trigger is clearly described.
- [ ] Functions and modules are listed.
- [ ] Responsible ownership is identified.

### Frontend and Workflow

- [ ] UI changes are documented.
- [ ] User interactions are documented.
- [ ] Loading, success, and failure states are included where applicable.
- [ ] Retry or recovery behavior is documented where applicable.
- [ ] Persistence behavior is documented where applicable.
- [ ] User navigation is clear.

### Dependencies

- [ ] Internal dependencies are listed.
- [ ] External dependencies are listed.
- [ ] Browser APIs are listed where applicable.
- [ ] State management dependencies are listed.
- [ ] Permissions are documented where applicable.

### Quality and Risk

- [ ] Validations are actionable.
- [ ] Test cases are verifiable.
- [ ] Worst-case scenarios are realistic.
- [ ] Expected issues are distinguished from worst-case scenarios.
- [ ] Assumptions are explicit.
- [ ] No unsupported technical details were invented.

### Writing Quality

- [ ] Content is detailed but not unnecessarily verbose.
- [ ] Bullets are concise and meaningful.
- [ ] Technical identifiers are consistent.
- [ ] Duplicate information is minimized.
- [ ] The document is understandable to both AI agents and human developers.

---

## 11. Recommended Output Template

Use this template as the default structure:

```md
# Dependency Chart Document: [Feature Name]

Date: [YYYY-MM-DD]
Version: [Version]

## 1. [Feature Name] – [User/Admin/Role]

**Function:** [Functions, hooks, utilities, services]

**Responsible Team/Module:**
- [Responsible module or team]
- [External service or integration, if applicable]

**Trigger:**
- [Event that initiates the workflow]

## Frontend Changes

### [Component or Area]
- [Required change]
- [Expected behavior]

### [User Interaction]
- [User action]
- [State update]
- [Service/API call]
- [Success behavior]
- [Failure behavior]

### [Loading and Error Handling]
- [Loading behavior]
- [Error behavior]
- [Retry behavior]

## Impact on User (Business Use Case)

### User
- [User benefit]
- [Workflow impact]

### Admin
- [Admin benefit]
- [Administrative impact]

## Does User Know What To Do (Navigation)

- [Step 1]
- [Step 2]
- [Step 3]
- [Expected result]
- [Recovery action, if applicable]

## Dependency On

### External Services
- [Dependency]

### Frontend Components
- [Dependency]

### Backend APIs
- [Dependency]

### Database
- [Dependency]

### Browser APIs
- [Dependency]

### UI Components
- [Dependency]

### State Management
- [Dependency]

## Integration Aspects

### Scalability
- [Scalability consideration]

### Security
- [Security consideration]

### Performance
- [Performance consideration]

### Reliability
- [Reliability consideration]

### Maintainability
- [Maintainability consideration]

### Vulnerabilities
- [Potential vulnerability or dependency risk]

## Possible Validations Required

- [Validation 1]
- [Validation 2]
- [Validation 3]

## Possible Test Case Scenarios

- [Test scenario 1]
- [Test scenario 2]
- [Test scenario 3]

## Possible Worst Case Scenario

- [Worst-case scenario 1]
- [Worst-case scenario 2]

## Expected Issues

### Global
- [Global issue]

### Function-Specific
- [Feature-specific issue]

### UI/UX
- [UI/UX issue]

### Integration
- [Integration issue]

## Assumptions

- [Assumption 1]
- [Assumption 2]
- [Assumption 3]
```

---

## 12. Final Instruction to the AI

When asked to create a Dependency Chart Document:

1. Understand the feature and its complete workflow.
2. Identify all involved users, modules, functions, services, states, and dependencies.
3. Organize the information using the required section order.
4. Describe both normal and failure behavior.
5. Include actionable validations and realistic test scenarios.
6. Document business impact and user navigation.
7. Identify scalability considerations, vulnerabilities, and expected issues.
8. Clearly separate confirmed information from assumptions.
9. Do not invent missing technical details.
10. Produce a clean, detailed, implementation-oriented Markdown document.
11. Keep the writing crisp enough to scan quickly, but thorough enough for AI agents and developers to understand the feature without relying on hidden context.
12. Do not add conclusions, recommendations, rankings, or unrelated commentary unless explicitly requested.
