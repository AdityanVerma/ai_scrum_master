# AGENT.md

# Decision List Documentation Guide

## Purpose

This guide instructs AI agents on how to create, review, and improve decision lists for OsmosisLearn product features.

The goal is to document the **business purpose, user intent, decisions, and expected outcomes** behind a workflow—not merely describe platform navigation or interface actions.

Decision lists should help someone understand:

- Why the actor is performing the task.
- What the actor needs to decide.
- What information or criteria influence the decision.
- What action follows from the decision.
- What outcome the actor is trying to achieve.
- What can go wrong and how the actor responds.

---

## 1. Core Principle

A decision list is not simply a sequence of UI steps.

### Avoid focusing only on:

- Opening a page.
- Clicking a button.
- Selecting a menu item.
- Filling in a field.
- Generating content.
- Saving a record.
- Navigating between screens.

These are platform actions. They may be included when useful, but they should not be presented as the main purpose of the decision list.

### Focus on:

- Business purpose.
- User intent.
- Choices the actor must make.
- Reasons behind those choices.
- Expected outcomes.
- Conditions that affect the decision.

Use this mental model:

> **Purpose → Decision → Reason/Criteria → Action → Outcome**

Not every bullet must contain all five elements, but the underlying intent should be clear.

---

## 2. Distinguish Between Four Types of Information

When reviewing source material, classify each statement as one of the following.

### A. Business Purpose

Explains why the actor is performing the task.

Examples:

- Admin wants to gather feedback to validate an idea or support a business decision.
- User wants their Profile to accurately represent their professional identity.
- Admin reviews an asset to determine whether it meets required quality standards.

### B. Business Decision

Explains what the actor needs to decide and why.

Examples:

- Admin decides whether the generated poll questions are relevant to the intended objective.
- User decides whether to build their Profile using their resume, the Capability Profiling questionnaire, or both.
- Admin decides whether an asset is ready for approval or requires further refinement.

### C. Platform Action

Explains how the actor performs the task in the application.

Examples:

- Go to the Pod Owner Workspace.
- Click Polls Manager.
- Upload a resume.
- Click Publish.

Platform actions can be included when they clarify the workflow, but they should not replace the underlying decision.

### D. System Behaviour

Explains what the platform does automatically.

Examples:

- Resume information is extracted automatically.
- AI generates poll questions.
- Updated information is reflected in the combined Profile.
- The published survey appears in the management workspace.

System behaviour belongs in the description, requirements, expected outcomes, or workflow details—not automatically in the decision list.

---

## 3. Recommended Overall Structure

Use the following structure where applicable:

```markdown
| Actor(s) involved | [Actor or actors] |
| ----------------- | ----------------- |
| Description       | [Business purpose and high-level outcome] |

### Decisions [Task or Feature Name]

- [Business purpose]
- [Important decision]
- [Reason or criteria influencing the decision]
- [Action resulting from the decision]
- [Expected outcome]

**[Optional Subsection]**

- [Related decision]
- [Related decision]

### Error Scenario

- [Error condition and how the actor responds]
```

Use subheadings when they improve clarity, especially for:

- Different stages of a process.
- Different feature areas.
- Different actor responsibilities.
- Optional versus mandatory paths.
- Separate activities such as Upload Resume, Questionnaire, Review, or Results.

Do not add unnecessary headings if a simple list is clearer.

---

## 4. Writing Business-Purpose Statements

Start by identifying the actor's objective.

Ask:

1. What is the actor trying to achieve?
2. Why is this task necessary?
3. What decision or outcome will the result support?
4. Who benefits from the outcome?
5. How will the collected information or completed task be used?

### Preferred wording

- Admin wants to...
- User needs to...
- Admin/User builds...
- Depending on the objective...
- To ensure that...
- So that...
- In order to...

### Example

Weak:

> Admin creates a poll.

Better:

> Admin wants to gather feedback from users to validate an idea or support a business decision.

---

## 5. Writing Decision Statements

A strong decision statement describes a meaningful choice, not just a click.

### Preferred verbs

Use verbs such as:

- Decides
- Determines
- Chooses
- Evaluates
- Reviews
- Assesses
- Identifies
- Selects
- Confirms
- Considers
- Determines whether
- Decides whether

### Include the reason when useful

Weak:

> Decides the number of questions.

Better:

> Decides the number of questions and question types required to collect meaningful feedback while maintaining a reasonable response rate.

Weak:

> Edits the generated questions.

Better:

> Reviews the generated questions and decides whether to accept, edit, regenerate, add, or remove questions so they align with the intended objective.

Weak:

> Uploads a resume.

Better:

> Chooses the most recent resume to use as the source for existing professional information.

---

## 6. Navigation and Platform Actions

Navigation is not forbidden. It should simply be placed in the correct context.

### Less useful

> Open Poll on the decided topic by clicking Create Poll.

### Better

> Locate the Poll function on the Pod Owner Workspace to create a new poll:
> - Go to the Pod Owner Workspace.
> - Click Polls Manager from the side menu.

The first sentence explains the purpose. The indented bullets explain the platform actions.

### Rule

Whenever a navigation step is necessary, try to introduce it with:

- Locate the function to...
- Access the feature to...
- Navigate to the relevant workspace to...
- Open the tool required to...

Do not treat navigation itself as the business decision.

---

## 7. Admin-Side Decision Lists

Admin decision lists should generally explain:

- Why the Admin needs the feature.
- What outcome the Admin wants.
- What information or settings must be defined.
- What criteria determine whether generated or submitted content is acceptable.
- Whether to publish, save, revise, reject, or delete.
- How the Admin handles incomplete or invalid information.

### Example: Poll Creation

```markdown
### Decisions [Poll Creation]

- Admin wants to gather feedback from users to validate an idea or support a business decision.
- Depending on the objective, Admin defines the purpose and expected outcome, including how the poll responses will be used.
- Admin decides the intended audience for the poll based on whose feedback is required.
- Admin defines the poll topic and intent so relevant questions can be generated.
- Admin decides the number of questions, question types, and settings required to collect meaningful feedback.
- Admin reviews the AI-generated questions and answer options to determine whether they align with the intended objective.
- Admin decides whether to accept, edit, regenerate, add, or remove questions before finalising the poll.
- Admin decides whether the poll is ready to publish, should be saved as a draft, or is no longer required and should be deleted.
```

---

## 8. User-Side Decision Lists

User-side lists should focus on the user's:

- Awareness.
- Understanding.
- Choices.
- Ability to complete the task.
- Confidence about what happens next.
- Ability to review, edit, submit, or exit.
- Access to outcomes or results.

Useful wording includes:

- User is aware of...
- User understands...
- User knows how to...
- User decides whether...
- User can review...
- User confirms...
- User is informed that...

### Example: Poll Participation

```markdown
### User Notification

- User receives a notification through the platform or sees the Poll when logging into the POD.
- User understands the purpose of the Poll.
- User decides whether to participate immediately or later if the Poll is optional.
- User is aware that mandatory Polls must be completed before continuing.

### Poll Participation

- User starts the Poll.
- User is aware of the total number of questions and their progress.
- User understands the questions and available answer options.
- User is aware of any mandatory response requirements.
- User knows how to navigate between questions.
- User knows how to submit the completed Poll.

### Poll Completion

- User is aware that the Poll has been submitted successfully.
- User is aware whether responses can be edited before submission.
- User knows how to exit the Poll where permitted.

### Poll Results

- User navigates to My Workspace to access completed Polls.
- User selects a specific Poll to view its results.
- User understands the available results and any relevant aggregated feedback.
```

---

## 9. Handling Optional and Mandatory Paths

When a feature behaves differently depending on a condition, document both paths clearly.

Examples of conditions:

- Mandatory versus optional.
- Draft versus published.
- Approved versus rejected.
- First submission versus revision.
- Before versus after a deadline.
- Within versus beyond the revision limit.

### Recommended style

```markdown
- User is aware that mandatory Polls must be completed before continuing.
- User decides whether to participate immediately or later if the Poll is optional.
```

Avoid describing only the UI error. Explain the user's understanding and available choice.

---

## 10. Review and Approval Workflows

For review workflows, document the criteria and consequences behind the decision.

### Example: Admin Reviewing an Updated Asset

```markdown
### Decisions [Need Further Attention]

- Admin reviews the updated asset to determine whether it meets the required quality and business standards.
- If the asset was previously returned, Admin reviews the comment history to assess whether the requested changes have been addressed.
- Admin decides whether the asset is ready for approval or requires further refinement.
- If further attention is required, Admin provides clear and actionable review comments.
- Admin determines whether the asset has reached the maximum number of revision attempts.
- If the maximum number of attempts has been reached, Admin decides whether to permanently reject the asset.
```

### Example: User Revising an Asset

```markdown
### Decisions [Need Further Attention]

- User reviews the Admin's feedback to understand the changes required.
- User decides how to address the feedback to meet the required quality standards.
- User updates the asset based on the review comments.
- User provides a summary of the changes made.
- User decides whether the asset is ready to be resubmitted for review.
- User resubmits the updated asset for review.
```

---

## 11. Profile and Data-Collection Features

For profile-building or data-collection features, distinguish between:

- The user's desired representation or outcome.
- The sources of information.
- The choices about what to include.
- Validation of extracted or entered information.
- Maintenance and future updates.
- Sharing or exporting.

### Example: Profile Creation

```markdown
### Decisions [User Profile Creation]

- Admin/User wants their Profile to provide an accurate representation of their professional identity, including experience, skills, interests, work style, and other relevant information.
- Admin/User decides whether to build their Profile using their resume, the Capability Profiling questionnaire, or both, based on the information they want to provide. Completing both provides a more complete Profile by combining existing professional information with additional capability and work-style insights.
- Admin/User chooses where to start building their Profile based on the information they already have available.

**Upload Resume**

- Chooses the most recent resume to use as the source for existing professional information.
- Reviews the information extracted from the resume and decides what to keep, edit, or remove so the Profile accurately reflects their experience, skills, interests, and certifications.
- Decides whether the extracted information is sufficient or whether additional information should be provided through the Capability Profiling questionnaire.

**Capability Profiling Questionnaire**

- Decides which questions to answer based on the information they want to include in their Profile.
- Reviews their responses and decides whether they accurately represent their capabilities, interests, and work style.
- Decides whether to complete the Profile in one session or build it progressively by saving and returning later.
- Decides whether to update their Profile when their professional information changes.
- Decides whether to share or print their Personal Career Reflection when needed.
```

---

## 12. Error Scenarios

An error scenario should describe:

1. What condition causes the error.
2. What the actor is prevented from doing.
3. What information or guidance is provided.
4. What alternative decision or action is available.

### Weak

> Unsupported file error appears.

### Better

> If the uploaded resume is unsupported, password-protected, or exceeds the 5 MB limit, the user is informed of the supported file requirements and decides whether to upload another resume or continue by completing the Capability Profiling questionnaire.

### Common error scenarios to consider

- Missing mandatory information.
- Invalid or unsupported file.
- File exceeds size limit.
- Attempting to submit without required comments.
- Attempting to submit incomplete content.
- Exceeding a revision limit.
- Attempting an action after a deadline.
- Attempting to access unavailable results.
- Attempting to publish content that does not meet required standards.
- Attempting to perform an action without permission.

Do not invent error scenarios that are not supported by the feature requirements or source material.

---

## 13. Common Mistakes to Avoid

### Mistake 1: Writing only navigation steps

Avoid:

> Click Profile, then click Edit Profile.

Improve:

> User accesses the Profile editing function to update information that no longer accurately represents them.

### Mistake 2: Treating system behaviour as a decision

Avoid:

> AI generates questions.

Improve:

> Admin reviews the AI-generated questions to determine whether they support the intended poll objective.

### Mistake 3: Listing actions without purpose

Avoid:

> Upload resume. Answer questions. Save profile.

Improve:

> Admin/User decides whether to provide information through a resume, the Capability Profiling questionnaire, or both to create a more complete professional Profile.

### Mistake 4: Using vague decisions

Avoid:

> Decides what to do next.

Improve:

> Decides whether the asset is ready for approval or requires further refinement.

### Mistake 5: Overusing technical language

Avoid implementation details such as:

- API calls.
- Database updates.
- Component names.
- Internal state changes.
- Backend function names.

Include technical details only when they affect the actor's decision or expected outcome.

### Mistake 6: Making unsupported assumptions

Do not invent:

- New roles.
- New permissions.
- New validation rules.
- New deadlines.
- New result visibility rules.
- New business purposes.

If information is missing, mark it as an open question or ask for clarification.

---

## 14. Quality Checklist

Before finalising a decision list, verify:

### Business Purpose

- [ ] Is it clear why the actor is performing the task?
- [ ] Is the intended outcome explained?
- [ ] Is the business value or use of the information clear?

### Decisions

- [ ] Does each important bullet describe a meaningful choice, evaluation, or intention?
- [ ] Are reasons or criteria included where useful?
- [ ] Are decisions distinguished from simple UI actions?
- [ ] Are alternative paths documented where applicable?

### User Experience

- [ ] Is the user's awareness and understanding documented?
- [ ] Can the user tell what is required, optional, or unavailable?
- [ ] Is it clear how the user completes the task?
- [ ] Is the outcome of completion clear?

### Platform Actions

- [ ] Are navigation steps included only where useful?
- [ ] Are they presented as supporting actions rather than the main business decision?

### Error Scenarios

- [ ] Are relevant failure conditions documented?
- [ ] Does each error explain what the actor can do next?
- [ ] Are unsupported assumptions avoided?

### Consistency

- [ ] Are actor names used consistently?
- [ ] Are terms such as Profile, Poll, Survey, PCR, and Capability Profiling capitalised consistently?
- [ ] Does the writing style match related feature documents?
- [ ] Are headings used only where they improve readability?

---

## 15. Final Review Question

Before approving the document, ask:

> **If someone who has never seen the platform reads this decision list, will they understand what the actor is trying to achieve, what choices they need to make, why those choices matter, and what outcome they expect?**

If the answer is yes, the decision list is likely aligned with the intended documentation style.

If the answer is no, reduce the focus on navigation and rewrite the statements around purpose, intent, criteria, decisions, and outcomes.
