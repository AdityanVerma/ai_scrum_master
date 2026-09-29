# Phase 6 — Tasklist + SOD/EOD Tracking

Phase 6 has focused on building the **foundation of the User Tasklist system** and connecting it with **Start-of-Day (SOD) / End-of-Day (EOD) tracking**.

The main objective has been to move from a simple tasklist into a system that can record:

* What a person planned for the day
* How tasks progressed
* What changed during the day
* What was completed
* What remained at EOD
* What should eventually be carried into the next day

---

# 1. Daily Tasklist Foundation

We created a dedicated daily tasklist system rather than treating tasks as independent records.

Each team member can have a tasklist for a particular date.

The core relationship is:

```text
Team Member
     │
     └── Daily Tasklist
            │
            ├── Parent Task
            │     ├── Subtask
            │     └── Subtask
            │
            ├── Parent Task
            │
            └── Parent Task
```

The `DailyTasklist` model includes:

* Member
* Date
* Tasklist status
* SOD capture timestamp
* EOD capture timestamp
* Tasks
* Snapshots
* Created/updated timestamps

We also added a uniqueness constraint so a member cannot have multiple tasklists for the same date.

**Status: ✅ Done**

---

# 2. Parent Tasks

The system supports creating normal top-level tasks.

A parent task contains:

* Title
* Category
* Estimated duration
* Order
* Status
* Priority

Example:

```text
[Development] Polls Implementation
Estimated: 4h
Priority: HIGH
Status: IN_PROGRESS
```

**Status: ✅ Done**

---

# 3. Subtasks

Parent tasks can contain subtasks.

Example:

```text
[Development] Polls Implementation
│
├── 1.1 Implement Frontend
├── 1.2 Implement Backend
└── 1.3 Testing
```

Subtasks are linked to their parent using the self-relation on `TasklistTask`.

The UI supports:

* Creating subtasks
* Editing subtasks
* Deleting subtasks
* Changing subtask status

**Status: ✅ Done**

---

# 4. Task Categories

Tasks can be categorized.

Current categories include:

```text
Development
Testing
Documentation
Meeting
Non-sprint
```

This is useful because the tasklist can distinguish development work from meetings, documentation, and other types of work.

**Status: ✅ Done**

---

# 5. Task Duration / Estimation

Each task has:

```text
estimatedMins
```

The UI allows the user to enter estimated duration.

Example:

```text
Backend and AI Agent
Estimated: 1h
```

For parent tasks with subtasks, the displayed parent duration is calculated from the subtasks.

Example:

```text
Parent
├── Subtask 1 → 60 min
├── Subtask 2 → 30 min
└── Subtask 3 → 30 min

Parent total → 120 min
```

**Status: ✅ Done**

---

# 6. Task Ordering

Tasks have an `order` field.

This allows the tasklist to preserve the user's planned sequence:

```text
1. Polls
2. Internal Management Tool
3. Documentation
4. Meeting
```

Subtasks also have their own ordering.

**Status: ✅ Done**

---

# 7. Task Status

We implemented task status handling.

Current statuses:

```text
PENDING
IN_PROGRESS
DONE
BLOCKED
```

Both parent tasks and subtasks can have their own status.

The parent and subtasks are currently treated independently rather than automatically synchronizing their statuses.

**Status: ✅ Done**

---

# 8. Task Priority

Priority was added as part of this phase.

Current priorities:

```text
HIGH
MEDIUM
LOW
```

The default is:

```text
MEDIUM
```

Priority is:

* Stored in Prisma
* Supported by the API
* Available when creating a task
* Available when editing a task
* Displayed as a visual badge

Example:

```text
Development    HIGH
```

with visual differentiation for `HIGH`, `MEDIUM`, and `LOW`.

**Status: ✅ Done**

---

# 9. Task CRUD APIs

We implemented the core task APIs.

## Get Tasklist

```text
GET /api/tasklists
```

Used to retrieve the daily tasklist.

## Create/Get Daily Tasklist

```text
POST /api/tasklists
```

Creates the tasklist when necessary and returns the existing tasklist when one already exists.

## Create Task/Subtask

```text
POST /api/tasklists/[tasklistId]/tasks
```

Supports:

* Parent tasks
* Subtasks
* Category
* Duration
* Order
* Priority

## Update Task

```text
PUT /api/tasklists/[tasklistId]/tasks
```

Supports updating:

* Title
* Category
* Duration
* Status
* Priority

## Delete Task

```text
DELETE /api/tasklists/[tasklistId]/tasks
```

**Status: ✅ Done**

---

# 10. Available Working Hours

We added the concept of available working hours for the day.

The user can specify something like:

```text
Available: 8h
```

The system then calculates the available capacity.

> **Current limitation:** available hours is a UI-only value (default `8`) held in page state. It is not saved to the database.

**Status: ✅ Done**

---

# 11. Planned Time Calculation

The system calculates total planned time based on the tasklist.

For parent tasks with subtasks, the subtasks are used to calculate the total.

Example:

```text
Task A → 2h
Task B → 1h

Task C
├── Subtask → 1h
└── Subtask → 1h

Total planned → 5h
```

**Status: ✅ Done**

---

# 12. Capacity Warning

The tasklist compares planned time with available working hours.

Example:

```text
Available: 8h
Planned:   9h

Over capacity by 1h
```

or:

```text
Available: 8h
Planned:   6h

Remaining capacity: 2h
```

This is the foundation for future AI-based workload and time-management assistance.

**Status: ✅ Done**

---

# 13. SOD Tracking

We added Start-of-Day tracking.

When the user clicks:

```text
Start Day
```

the system records:

```text
sodCapturedAt
```

This establishes when the day's initial plan was captured.

**Status: ✅ Done**

---

# 14. EOD Tracking

We added End-of-Day tracking.

When the user clicks:

```text
End Day
```

the system records:

```text
eodCapturedAt
```

This establishes when the final state of the day was captured.

**Status: ✅ Done**

---

# 15. Tasklist Snapshot System

We didn't want SOD/EOD to only store timestamps.

We therefore created a separate:

```text
TasklistSnapshot
```

model.

A snapshot contains:

```text
tasklistId
type
capturedAt
tasks
```

The `type` identifies:

```text
SOD
EOD
```

So the system preserves the actual task state at those points in time.

**Status: ✅ Done**

---

# 16. SOD Task Snapshot

When SOD is captured:

```text
Current tasklist
      ↓
Read current tasks
      ↓
Create SOD snapshot
      ↓
Store task state
```

This means later task modifications don't alter the historical SOD snapshot.

**Status: ✅ Done**

---

# 17. EOD Task Snapshot

The same mechanism was implemented for EOD.

When EOD is captured:

```text
Current tasklist
      ↓
Read current tasks
      ↓
Create EOD snapshot
      ↓
Store task state
```

This allows the system to compare the beginning and end of the day.

**Status: ✅ Done**

---

# 18. Snapshot Retrieval API

We added:

```text
GET /api/tasklists/[tasklistId]
```

This retrieves:

* SOD timestamp
* EOD timestamp
* Snapshots
* Captured task data

The frontend uses this to build the SOD/EOD summary.

**Status: ✅ Done**

---

# 19. SOD/EOD Status Indicators

The tasklist UI now shows:

```text
[SOD ✓] [EOD —]
```

or after both are captured:

```text
[SOD ✓] [EOD ✓]
```

The capture time is also displayed.

**Status: ✅ Done**

---

# 20. Duplicate SOD/EOD Protection

We added backend protection against capturing SOD or EOD multiple times.

If SOD has already been captured:

```text
SOD has already been captured for this tasklist.
```

Likewise for EOD.

The UI also disables the corresponding button after capture.

Example:

```text
Before:
[ Start Day ]

After:
[ SOD Captured ]
```

**Status: ✅ Done**

---

# 21. SOD vs EOD Comparison

We added comparison logic between the two snapshots.

The system identifies:

### Completed

Tasks that were not `DONE` at SOD but became `DONE` at EOD.

### Added During Day

Tasks that exist in EOD but did not exist in SOD.

### Remaining

Tasks that were still not `DONE` at EOD.

The UI currently displays counts for each.

**Status: ✅ Done**

---

# 22. SOD/EOD Task Names

The comparison was expanded from just numbers to actual task names.

Example:

```text
Completed

✓ Polls Implementation
✓ Backend and AI Agent

Added During Day

+ Tasklist automation

Remaining

○ Documentation
○ Frontend
```

**Status: ✅ Done**

---

# 23. Latest SOD/EOD Handling

During development, we generated multiple test snapshots.

We adjusted the frontend comparison so that it selects the **latest SOD** and **latest EOD** rather than simply taking the first snapshot returned.

This prevents older test snapshots from being used for the comparison.

The old test snapshots remain in the database for now, as we decided not to spend time cleaning them up during development.

**Status: ✅ Done**

---

# 24. EOD Tasklist Freeze

We decided that after EOD, the day's tasklist should become a historical record.

This is important because otherwise someone could change a task after EOD and make the EOD snapshot inconsistent with the actual final state.

## Backend Protection

After EOD:

```text
POST → blocked
PUT  → blocked
DELETE → blocked
```

## UI Protection

After EOD:

```text
Add Task        ❌
Parent Status   ❌
Parent Edit     ❌
Parent Delete   ❌
Subtask Status  ❌
Subtask Edit    ❌
Subtask Delete  ❌
```

So the tasklist becomes effectively read-only.

**Status: ✅ Done**

---

# 25. Carry-Forward Foundation

We started the carry-forward functionality but deliberately decided to **pause it**.

We added:

```text
carriedForwardFromId
```

to `TasklistTask`.

We also created a carry-forward API capable of creating a new task based on an unfinished task.

However, we identified that the first implementation was targeting the wrong tasklist — it was creating the task in the current tasklist rather than properly targeting the next working day.

We therefore decided:

> **Carry Forward will be implemented later.**

So the database foundation/API exists, but the feature itself is **not considered complete**.

The carry-forward endpoint is `POST /api/tasklists/[tasklistId]` with `{ sourceTaskId }`, and the "Carry Forward" button in the tasklist UI is currently commented out.

**Status: ⏸️ Deferred**

---

# 26. Current API Reference

| **Method** | **Endpoint**                          | **Purpose**                                                                                          |
| ---------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| GET        | `/api/tasklists?memberId=&date=`      | Fetch a member's tasklist for a date, with tasks ordered by `order` (`data` is `null` if none exists) |
| POST       | `/api/tasklists`                      | Create the tasklist for `{ memberId, date }`, or return the existing one                              |
| GET        | `/api/tasklists/[tasklistId]`         | Fetch SOD/EOD timestamps and snapshots                                                               |
| PATCH      | `/api/tasklists/[tasklistId]`         | Capture SOD or EOD with `{ action: "SOD" \| "EOD" }`; returns `409` if already captured              |
| POST       | `/api/tasklists/[tasklistId]`         | Carry-forward: copy `{ sourceTaskId }` into this tasklist as a new `PENDING` parent task             |
| POST       | `/api/tasklists/[tasklistId]/tasks`   | Create a task or subtask; returns `409` after EOD                                                    |
| PUT        | `/api/tasklists/[tasklistId]/tasks`   | Update title, category, duration, status, or priority; returns `409` after EOD                       |
| DELETE     | `/api/tasklists/[tasklistId]/tasks?taskId=` | Delete a task; returns `409` after EOD                                                         |

---

# 27. Known Limitations (Current Build)

* The `/tasklist` page uses one hard-coded member ID and only loads today's date. There is no member selector, date picker, or history view yet.
* The page has no "create tasklist" action. It shows "No tasklist has been created for today" until a tasklist is created through `POST /api/tasklists`.
* `/tasklist` is not linked from the header navigation.
* `DailyTasklist.status` defaults to `DRAFT` but is never updated, so the tasklist lifecycle is still pending.
* The SOD vs EOD comparison is calculated in the browser from the stored snapshots. It is not stored or exposed through an API.
* Carry-forward copies only the parent task (not its subtasks), and it does not check whether the target tasklist is already frozen by EOD.

---

# Phase 6 — Complete Status

## ✅ Completed

| **Feature**                           | **Status** |
| ------------------------------------- | ---------- |
| Daily tasklist database model         | ✅ Done     |
| Daily tasklist per member/date        | ✅ Done     |
| Parent tasks                          | ✅ Done     |
| Subtasks                              | ✅ Done     |
| Parent/subtask relationship           | ✅ Done     |
| Task categories                       | ✅ Done     |
| Estimated duration                    | ✅ Done     |
| Task ordering                         | ✅ Done     |
| Task status                           | ✅ Done     |
| Task priority                         | ✅ Done     |
| Priority create/edit/display          | ✅ Done     |
| Task CRUD APIs                        | ✅ Done     |
| Subtask CRUD                          | ✅ Done     |
| Automatic parent duration calculation | ✅ Done     |
| Available working hours               | ✅ Done     |
| Planned time calculation              | ✅ Done     |
| Capacity calculation                  | ✅ Done     |
| Over-capacity warning                 | ✅ Done     |
| SOD timestamp                         | ✅ Done     |
| EOD timestamp                         | ✅ Done     |
| SOD capture API                       | ✅ Done     |
| EOD capture API                       | ✅ Done     |
| Tasklist snapshot model               | ✅ Done     |
| SOD task snapshot                     | ✅ Done     |
| EOD task snapshot                     | ✅ Done     |
| Snapshot retrieval API                | ✅ Done     |
| SOD/EOD status indicators             | ✅ Done     |
| SOD/EOD capture time                  | ✅ Done     |
| Duplicate SOD protection              | ✅ Done     |
| Duplicate EOD protection              | ✅ Done     |
| SOD vs EOD comparison                 | ✅ Done     |
| Completed task detection              | ✅ Done     |
| Added task detection                  | ✅ Done     |
| Remaining task detection              | ✅ Done     |
| Comparison counts                     | ✅ Done     |
| Comparison task names                 | ✅ Done     |
| Latest SOD/EOD selection              | ✅ Done     |
| EOD backend freeze                    | ✅ Done     |
| EOD UI freeze                         | ✅ Done     |

---

## ⏸️ Started / Deferred

| **Feature**                       | **Status**  |
| --------------------------------- | ----------- |
| Carry-forward database field      | ✅ Done      |
| Carry-forward API foundation      | ✅ Done      |
| Carry-forward UI                  | ⏸️ Deferred |
| Carry-forward to next working day | ⏸️ Deferred |

---

# Still Remaining in Phase 6

| **Feature**                                | **Status** |
| ------------------------------------------ | ---------- |
| Tasklist lifecycle/status                  | ⏳ Pending  |
| Detailed SOD → EOD change tracking         | ⏳ Pending  |
| Status-change tracking                     | ⏳ Pending  |
| Priority-change tracking                   | ⏳ Pending  |
| Duration/estimate-change tracking          | ⏳ Pending  |
| Actual time tracking                       | ⏳ Pending  |
| Estimated vs actual time variance          | ⏳ Pending  |
| Priority-based task ordering               | ⏳ Pending  |
| Better workload/time-management assistance | ⏳ Pending  |
| Tasklist history                           | ⏳ Pending  |
| Daily tasklist reminders                   | ⏳ Pending  |
| SOD reminder                               | ⏳ Pending  |
| EOD reminder                               | ⏳ Pending  |
| In-app notifications                       | ⏳ Pending  |
| Email notifications                        | ⏳ Pending  |
| Reusable reminder engine                   | ⏳ Pending  |
| AI priority suggestions                    | ⏳ Pending  |
| AI time/capacity analysis                  | ⏳ Pending  |
| AI task ordering                           | ⏳ Pending  |
| AI EOD summary                             | ⏳ Pending  |
| AI Scrum Master recommendations            | ⏳ Pending  |

---

# Phase 6 Architecture

The current Phase 6 architecture can be represented as:

```text
                    TEAM MEMBER
                         │
                         ▼
                  DAILY TASKLIST
                         │
            ┌────────────┼────────────┐
            ▼            ▼            ▼
        Parent Task   Parent Task   Parent Task
            │
            ├── Subtask
            ├── Subtask
            └── Subtask
                         │
                         ▼
                 Task Status / Priority
                         │
                         ▼
              Planned Time / Capacity
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
             SOD                   EOD
              │                     │
              ▼                     ▼
        SOD Snapshot          EOD Snapshot
              │                     │
              └──────────┬──────────┘
                         ▼
                  SOD vs EOD
                   Comparison
                         │
             ┌───────────┼───────────┐
             ▼           ▼           ▼
         Completed     Added       Remaining
```

---

# Phase 6 Overall Status

### Core Tasklist + SOD/EOD Foundation

**✅ Largely Complete**

The system can now:

```text
Create Daily Tasklist
        ↓
Add Parent Tasks
        ↓
Add Subtasks
        ↓
Set Priority / Duration / Status
        ↓
Calculate Planned Capacity
        ↓
Capture SOD
        ↓
Continue Working
        ↓
Capture EOD
        ↓
Freeze Tasklist
        ↓
Compare SOD vs EOD
        ↓
Show Completed / Added / Remaining
```

### Remaining Major Areas

The remaining work can be grouped into:

```text
Tasklist Lifecycle
        ↓
Detailed Change / Actual-Time Tracking
        ↓
History & Analytics
        ↓
Reminder / Notification Engine
        ↓
Carry Forward
        ↓
AI Scrum Master Layer
```

---

## Phase 6 Checkpoint

**Phase 6 — Tasklist + SOD/EOD Tracking: 🟢 Core Foundation Complete**

The core daily tasklist, task hierarchy, status/priority management, capacity calculation, SOD/EOD snapshots, comparison, and EOD freeze are implemented.

The remaining items are primarily **advanced tracking, history, notifications, carry-forward, and AI-assisted functionality**.
