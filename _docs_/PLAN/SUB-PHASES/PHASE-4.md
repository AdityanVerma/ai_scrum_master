# Phase 4 — Team & Task Assignment

**Phase 4 is complete. ✅**

The goal of this phase was to make the Scrum Master capable of answering:

> **Who is suitable for this task based on skills, and who should the task be assigned to?**

---

# What We Built in Phase 4

## 6.1 — Team Member Model ✅

Added team members to the database using Prisma.

```text
TeamMember
├── id
├── name
├── role
├── skills
└── assignedTasks
```

We also created `TeamMemberSkill` for storing each member's individual skills.

---

## 6.2 — Team Member CRUD ✅

Built APIs to manage team members:

```text
POST   /api/team-members
GET    /api/team-members
GET    /api/team-members/[id]
PATCH  /api/team-members/[id]
DELETE /api/team-members/[id]
```

We tested:

* Creating a member
* Getting all members
* Getting an individual member
* Updating a member
* Deleting a member

So the system now has complete CRUD functionality for team members.

---

## 6.3 — Skill Matching ✅

Built the skill-matching system using:

```text
normalize-skill.ts
find-members-by-skills.ts
calculate-skill-match.ts
get-assignment-candidates.ts
```

### Skill Normalization

The system handles variations such as:

```text
NEXT JS
Next.js
next js
```

and treats them as the same skill.

### Skill Match Calculation

The system calculates:

* Matched Skills
* Missing Skills
* Match Percentage

Example:

```text
Required Skills:
Next.js
TypeScript

Adityan:
Next.js
TypeScript

Match: 100%
```

This provides a measurable basis for recommending suitable team members.

---

## 6.4 — Task Assignment ✅

Connected `SprintTask` with `TeamMember`.

```text
SprintTask
    ↓
assignedTo
    ↓
TeamMember
```

We added the Prisma relation:

```text
SprintTask.assignedToId
```

and created:

```text
src/lib/db/assign-task.ts
```

along with the API:

```text
PATCH /api/sprints/[id]/tasks/[taskId]/assignment
```

Assignments are persisted in PostgreSQL.

So once a task is assigned, the assignment survives page refreshes.

---

## 6.5 — Skill-Based Assignment ✅

Instead of manually providing required skills, the system can now read the skills directly from the task.

The flow is:

```text
Task
  ↓
TaskSkill
  ↓
Required Skills
  ↓
Team Members
  ↓
Skill Matching
  ↓
Ranked Candidates
```

We created:

```text
get-task-assignment-candidates.ts
recommend-task-assignee.ts
```

These are exposed through three `POST` endpoints:

```text
POST /api/assignment/candidates            { requiredSkills: string[] }
POST /api/assignment/task-candidates       { taskId }
POST /api/assignment/task-recommendation   { taskId }
```

The system identifies the highest-matching team member based on the required skills.

> **Note:** wherever this document says "AI recommendation", it refers to this deterministic skill-match ranking (normalized skill overlap, top candidate first). It does not call an LLM.

### No Required Skills

We also handled tasks with **no required skills**.

In that case, the system returns no skill-based candidates rather than making an arbitrary recommendation.

---

## 6.6 — Assignment UI ✅

The Sprint Detail page now allows three assignment paths.

### AI Recommendation

The system can recommend a suitable team member:

```text
Recommend Assignee
        ↓
Adityan — 100%
```

### Explicit Assignment

The recommended member can then be assigned:

```text
[ Assign ]
```

### Manual Override

The user can also select **any team member**, regardless of the AI recommendation:

```text
Assign Manually

[ Adityan ▼ ]
[ Rahul     ]
[ Aman      ]
```

This means the AI **doesn't control the final assignment**.

The final flow is:

```text
                    ┌──→ Assign Recommended
                    │
Task → AI Recommendation
                    │
                    └──→ Choose Any Member Manually
                                      ↓
                               Final Assignment
```

We also confirmed that assignments remain after refreshing the page.

---

# What Phase 4 Does NOT Do

We intentionally haven't considered workload or capacity yet.

For example:

```text
Adityan
Skill Match: 100%
Current Assigned: 30h
Capacity: 32h
Remaining: 2h
```

The system currently says:

> **Adityan has the best skills.**

It does **not yet say:**

> **Adityan has enough time to take this task.**

Workload and capacity management will be handled in a later phase.

---

# Phase 4 Final Architecture

```text
                    TEAM
                      │
             ┌────────┴────────┐
             ↓                 ↓
       Team Members         Skills
             │
             │
             ↓
        Sprint Task
             │
             ├── Required Skills
             │
             ↓
       Skill Matching
             │
             ↓
      Ranked Candidates
             │
             ↓
      AI Recommendation
             │
             ├──→ Assign Recommended
             │
             └──→ Manual Member Selection
                          │
                          ↓
                   Final Assignment
```

---

# What Phase 4 Achieved

| **Capability**                       | **Status** |
| ------------------------------------ | ---------- |
| Team member database model           | ✅          |
| Team member skills                   | ✅          |
| Team member CRUD                     | ✅          |
| Skill normalization                  | ✅          |
| Skill matching                       | ✅          |
| Match percentage                     | ✅          |
| Matched/missing skills               | ✅          |
| Task → Team Member relation          | ✅          |
| Task assignment API                  | ✅          |
| PostgreSQL assignment persistence    | ✅          |
| Skill-based candidates               | ✅          |
| Skill-match assignee recommendation (rule-based) | ✅          |
| Manual assignment                    | ✅          |
| Assignment UI                        | ✅          |
| Assignment persistence after refresh | ✅          |
| No-skill task handling               | ✅          |

---

# Final Outcome

**Phase 4 transformed the system from simply tracking tasks into a system that can connect tasks with the people who can perform them.**

The system can now:

```text
PLAN
  ↓
PERSIST
  ↓
RETRIEVE
  ↓
ACTIVATE
  ↓
EXECUTE
  ↓
MATCH SKILLS
  ↓
RECOMMEND ASSIGNEE
  ↓
ASSIGN TASK
  ↓
TRACK EXECUTION
```

### Phase 4: ✅ COMPLETE
