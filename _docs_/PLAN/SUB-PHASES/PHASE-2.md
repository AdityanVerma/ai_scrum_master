# Phase 2 — Sprint Retrieval

## Main Goal

In Phase 1, we made the system able to:

> **Generate → Save a Sprint**

In Phase 2, we made it able to:

> **Retrieve → View a saved Sprint**

So the overall flow became:

```text
Phase 1
Generate Sprint
      ↓
PostgreSQL
      ↓
Saved
```

```text
Phase 2
PostgreSQL
      ↓
Retrieve Sprint
      ↓
Display in UI
```

---

## 1. Created the "Get All Sprints" Database Function

We created:

```text
src/lib/db/get-sprints.ts
```

with `getSprints()`.

It retrieves all saved sprints from PostgreSQL and includes their related:

* Tasks
* Skills
* Dependencies
* Dependents

We also sorted them by `createdAt` so the newest sprint appears first.

```text
Sprint
 ├── Task 1
 │    ├── Skills
 │    └── Dependencies
 ├── Task 2
 │    ├── Skills
 │    └── Dependencies
 └── ...
```

---

## 2. Created the "Get All Sprints" API

We created:

```text
src/app/api/sprints/route.ts
```

with:

```text
GET /api/sprints
```

The flow is:

```text
GET /api/sprints
       ↓
getSprints()
       ↓
Prisma
       ↓
PostgreSQL
       ↓
All saved sprints
```

---

## 3. Tested the API

We opened:

```text
/api/sprints
```

and confirmed that your previously generated:

> **Poll Manager Improvements**

was actually being returned.

This was important because it proved that the data wasn't only being displayed immediately after generation — it was **persisted and retrievable later**.

---

## 4. Created the Saved Sprints Page

We created:

```text
src/app/sprints/page.tsx
```

This became your basic **Sprint History** page.

It displays saved sprints with:

* Sprint name
* Goal
* Start date
* End date
* Estimated hours

Currently it looks roughly like:

```text
Saved Sprints

Previously generated sprint proposals.
```

```text
Poll Manager Improvements

Improve poll creation and make poll results easier to manage.

09/09/2026 → 30/09/2026    46 hours

[ View Sprint ]
```

---

## 5. Created Retrieval for a Single Sprint

Then we created:

```text
src/lib/db/get-sprint.ts
```

with:

```text
getSprint(id)
```

This retrieves **one specific sprint** along with its complete related information.

---

## 6. Created the Single-Sprint API

We added:

```text
src/app/api/sprints/[id]/route.ts
```

which provides:

```text
GET /api/sprints/[id]
```

So now we have:

```text
GET /api/sprints
        ↓
All sprints
```

and:

```text
GET /api/sprints/[id]
        ↓
One specific sprint
```

We also added proper `404` handling if the sprint doesn't exist.

You tested both the successful case and the fake-ID case, and both worked.

---

## 7. Created the Sprint Detail Page

We created:

```text
src/app/sprints/[id]/page.tsx
```

This displays the complete sprint.

For each task, we show:

* Task ID
* Title
* Description
* Complexity
* Skills
* Estimated hours
* Dependencies

So instead of only seeing:

```text
Poll Manager Improvements
46 hours
```

you can now drill into:

```text
Poll Manager Improvements
│
├── TASK-001
│   ├── Description
│   ├── MEDIUM
│   ├── Next.js, TypeScript
│   └── 6 hours
│
├── TASK-002
│   ├── ...
│
└── TASK-006
    ├── ...
```

---

## 8. Connected the Two Pages

Finally, we added:

```text
[ View Sprint ]
```

to the Saved Sprints page.

Clicking it takes you from:

```text
/sprints
```

to:

```text
/sprints/[id]
```

So the user journey is now:

```text
              Saved Sprints
                   │
                   ▼
       ┌─────────────────────┐
       │ Poll Manager        │
       │ Improvements        │
       │                     │
       │ 46 hours            │
       │ [ View Sprint ]     │
       └──────────┬──────────┘
                  │
                  ▼
             Sprint Detail
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
     Tasks      Skills   Dependencies
```

---

# What Phase 2 Achieved

| **Capability**          | **Status** |
| ----------------------- | ---------- |
| Fetch all saved sprints | ✅          |
| `GET /api/sprints`      | ✅          |
| Sprint history page     | ✅          |
| Fetch individual sprint | ✅          |
| `GET /api/sprints/[id]` | ✅          |
| Sprint detail page      | ✅          |
| View Sprint navigation  | ✅          |
| Display tasks           | ✅          |
| Display skills          | ✅          |
| Display dependencies    | ✅          |
| 404 handling            | ✅          |
| Production build        | ✅          |

---

## In One Sentence

**Phase 1 taught your Scrum Master to remember sprints; Phase 2 taught it to find and show those remembered sprints.**

The next logical layer is **Phase 3 — Sprint Execution**, where a saved proposal stops being just a document and starts becoming an **active sprint that can be tracked**.
