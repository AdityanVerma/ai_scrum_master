# Phase 8 — Progress Tracking & 25% / 50% / 75% Checks (Plan)

*Plan only; nothing in this document is built yet. Written 30 September 2026 from a discussion with the senior team and from the code at that date. The decisions in section 12 were confirmed the same day, all as recommended. The plan was then checked against the code and updated: End Day saves time in one request, sprint task status rules, a carry-over button, a total estimate for work outside the sprint, and marks whose planned dates are calculated rather than stored.*

Today the app can plan a sprint, assign tasks, and let each person keep a daily tasklist, but the three do not talk to each other. A daily task is free text, so nobody can say "Feature X is 60% done" or "this sprint will finish four days late". This phase connects them.

---

# 1. What Was Asked

| # | Ask | Where in this plan |
| - | --- | ------------------ |
| 1 | Work out a **weight for each function** when the sprint is created (if two of ten functions take twice as long as the other eight, they should count twice as much), using the AI's time estimates | Section 4 |
| 2 | Track the **daily tasklist together with the sprint tasks** assigned to each person, so **% completion** can be tracked | Sections 5, 6 |
| 3 | Everyone, including the Scrum Master, can see whether work **will be delayed or is already delayed** | Section 7 |
| 4 | **Tag** daily tasks with the sprint task and organise them by feature (every feature has documentation and development), so AI agents can follow what is being worked on | Sections 4, 5 |
| 5 | Linking is **optional**, because people also do work outside the sprint. Show how much other work is eating into sprint time, or whether there is spare time | Sections 5, 7 |
| 6 | Developers can track the **25%, 50% and 75% marks** of each feature, for documentation and for development separately | Section 8 |

This is the "25% 50% and 75% Check" phase in `PHASES.md`, and it answers the open pain points 1.2 (actual time spent, exceeding the estimate), 1.3 (milestone tracking, spotting delayed work) and 2.3 (sprint milestones).

---

# 2. The Idea in One Picture

```text
Sprint
└── Function (feature)                        weight = its share of the sprint's estimated hours
    ├── Sprint task  [Development]  12h       ┐
    ├── Sprint task  [Development]   8h       │ each sprint task has a work type
    └── Sprint task  [Documentation] 4h       ┘ and an AI estimate
            ▲
            │  optional link
            │
Daily tasklist task  "Polls - frontend"  4h planned, 3h spent
            (belongs to one person, one day)

Time spent on linked tasklist tasks  ─►  progress of each sprint task
Progress of tasks (weighted by hours) ─►  progress of function, work type, person, sprint
Progress compared with the calendar   ─►  ON TRACK / AT RISK / DELAYED, projected finish
Progress reaching 25 / 50 / 75 / 100  ─►  a mark, with planned date and reached date
```

---

# 3. What the App Has Today, and What Is Missing

| Need | Today | Missing |
| ---- | ----- | ------- |
| Functions | `SprintFunction` rows (name, description) are saved with the sprint | Tasks are **not linked** to a function. The AI only receives the function names and returns tasks with no function |
| Work type of a sprint task | Nothing. The planner writes "development tasks" | A category on sprint tasks (Development, Documentation, Testing) |
| Estimate | Sprint tasks have AI `estimatedHours` and complexity | Nothing |
| Link between a daily task and a sprint task | None. Daily tasks are free text. Only `carriedForwardFromId` links a task to yesterday's | An optional link |
| Time actually spent | Nothing, only `estimatedMins` on a daily task | Time spent per daily task (also needed by the Daily Sprint Diary, decision D1) |
| Progress | The sprint page shows *done tasks ÷ all tasks*, so a 1-hour task counts the same as a 20-hour one | Progress weighted by hours, per function, work type, person and sprint |
| Expected progress | Nothing | A working-day calendar (weekends now; public holidays and leave once the Diary's time-off records exist) |
| Delay warning | Nothing. Only the "Overtime" badge after the end date | On track / at risk / delayed, and a projected finish date |
| 25 / 50 / 75 marks | Nothing | Planned date and reached date per mark |

---

# 4. Function Weightage (Ask 1) and Tagging (Ask 4)

## Weight comes from the estimates

The AI already estimates hours for every task. A separate "weight" from the AI would be a second opinion on the same question, so the plan is:

```text
function weight = hours of the function's tasks ÷ hours of all tasks in the sprint
```

Worked example, ten functions. Two big ones, each 16 h of tasks; eight small ones, each 8 h:

```text
Total = 2 × 16 + 8 × 8 = 96 h
Big function   = 16 / 96 = 16.7 %   (×2 = 33.3 %)
Small function =  8 / 96 =  8.3 %   (×8 = 66.7 %)
```

A big function counts twice as much towards the sprint's progress, exactly as the senior team described. The weight is worked out when needed (never stored), so it stays correct if an estimate changes. To change a weight, change the task estimates.

## What has to change in planning

1. The task-breakdown step returns, for every task, **which function it belongs to** (checked against the function list; anything unmatched goes under "Other") and a **work type**.
2. For every function the breakdown adds a **documentation task** next to its development tasks ("for every feature we have documentation and development"). The Scrum Master can delete any of them on the Plan Sprint preview before saving.
3. Saving the sprint stores the function and work type on each sprint task.
4. The Plan Sprint preview groups tasks by function and shows each function's weight.
5. Sprints created before this change have tasks with no function. They show under "Not assigned to a function", and the Scrum Master can pick a function and work type for each task on the sprint page.

Work types reuse the tasklist categories: **Development, Documentation, Testing**, plus the two the team already uses in its diaries (**Research, Deployment**, Diary decision D5). Meeting and Non-sprint stay for daily tasks only.

---

# 5. Linking Daily Tasks to Sprint Tasks (Asks 2, 4, 5)

## The link is optional

When adding a daily task there is a new, optional field **Sprint task**:

```text
Add task
  Sprint task (optional):  [ none ▾ ]      ← lists sprint tasks assigned to me in active sprints,
                                             grouped by function
  Title / Category / Priority / Estimate
```

* **Choosing one** fills in the title, category and an estimate: the sprint task's remaining time (estimate minus time already spent), but no more than the hours available today, so one long task does not fill the capacity bar on its own. Everything stays editable.
* **Choosing none** makes an ordinary task: another project, a meeting, support work, anything not in the sprint. Work outside the sprint that runs over several days (for example a pilot) can have an optional **total estimate**, so the diary can still show `[8 hrs/20 hrs]`.
* Only sprint tasks assigned to the person can be picked, and the server checks this.
* Subtasks belong to their parent's sprint task.
* A **Carry over unfinished tasks** button copies yesterday's unfinished tasks into today's list. The carry-forward API already exists but has no button yet. Carrying keeps the link and the total estimate, so time adds up across days.
* The tasklist shows a small badge (`Feature · TASK-003`) on linked tasks and an option to group the list by feature.

## Time spent

At **End Day**, each task asks for the time actually spent, pre-filled with the estimate so it is one click when the estimate was right. (Same field the Daily Sprint Diary needs, so it is built once.)

End Day sends the time for every task **in the same request** that takes the End Day snapshot and locks the list. Today End Day already locks the list, and a locked list refuses changes, so the time cannot be saved in a second call afterwards. Doing both together also means the snapshot records the time and the link.

For linked tasks, End Day also asks:

* *"Is the whole sprint task finished?"* A day's task being done is not the same as the sprint task being done, so the sprint task is only marked `DONE` when the person says so.
* The first time someone logs time against a sprint task, it moves from `TODO` to `IN_PROGRESS` by itself (a `BLOCKED` task stays blocked).

These have to work with the sprint task rules that already exist:

```text
TODO         → IN_PROGRESS, BLOCKED
IN_PROGRESS  → TODO, DONE, BLOCKED
BLOCKED      → TODO, IN_PROGRESS
DONE         → nothing (final today)
```

* **"Finished"** moves the task to `DONE`, going through `IN_PROGRESS` first when it is `TODO` or `BLOCKED`.
* **The Scrum Master can reopen** a `DONE` task (back to `IN_PROGRESS`), so a wrong "yes" can be undone. This changes today's rule that `DONE` is final.
* **Ended sprints and reassigned tasks:** since Phase 7, tasks in a completed sprint are read only, and only the assignee changes a task's status. If either applies by End Day, the time is still saved and only the status change is skipped, with a short note. End Day never fails because of it.

The tasklist and sprint-page statuses stay separate (they mean different things); these rules keep them consistent.

---

# 6. How Progress Is Calculated (Asks 2, 6)

## Task progress

```text
DONE                       → 100 %
TODO / IN_PROGRESS / BLOCKED → time spent ÷ estimate, but never more than 90 %
```

The 90 % cap means a task is never "complete" until someone says it is, so a task that ran over its estimate does not look finished. Time spent on a sprint task is the total logged on every linked daily task, across days and people.

## Roll-ups (weighted by estimated hours)

```text
Function progress = Σ (task progress × task hours) ÷ Σ task hours
Same formula for: one work type inside a function, one person's tasks, the whole sprint
```

Worked example, one function:

```text
Development task   12 h, DONE                         → 100 % → 12.0 h earned
Documentation task  4 h, 2 h spent, not done          →  50 % →  2.0 h earned

Function progress = (12.0 + 2.0) ÷ 16 = 87.5 %   (Development 100 %, Documentation 50 %)
```

## Without linking

Progress still works when nobody links anything: a sprint task set to `DONE` on the sprint page counts 100 %, everything else 0 %. Linking and logging time make the in-between numbers more accurate. A sprint where nobody links will therefore look "behind" until tasks are marked done, so the sprint page shows a hint ("No time logged against 5 in-progress tasks").

---

# 7. Are We Delayed? (Asks 3, 5)

## Expected progress

```text
expected % on a day = working days finished ÷ working days in the sprint
```

Working days are Monday to Friday between the sprint's start and end date. Public holidays and leave are taken out once the Diary's time-off records exist. It is a straight line, which is crude (real work is not evenly spread), but it is easy to understand and to explain to the team.

Day counting reuses the helpers behind the Overtime badge (`src/lib/sprint-status.ts`), so "today" is the viewer's local date and both always agree on which day it is.

## Status

```text
gap = actual % − expected %

gap ≥ −5 points          → ON TRACK
−15 ≤ gap < −5           → AT RISK
gap < −15, or sprint end date passed with unfinished tasks → DELAYED
```

"End date passed with unfinished tasks" is the same rule as the Overtime badge, so a sprint with the badge always shows DELAYED.

Example: a 10-working-day sprint, end of day 4, expected 40 %. Actual 30 % gives a gap of −10, so **AT RISK**.

## Forecast ("will be delayed")

The gap only says where we are. The forecast says where we are heading:

```text
pace      = progress points gained per working day over the last 5 working days (needs at least 3 days of data)
days left = (100 − actual %) ÷ pace
projected finish = today + days left (working days)
```

If the projected finish is after the sprint end, the status is at least AT RISK even when the gap is small, and the page says how far over: *"Projected finish 14 Oct, 4 working days after the end date."*

## Where it is shown

The same status appears for the sprint, for each function (and for its Development and Documentation parts), and for each person's assigned tasks.

## Other work eating sprint time (Ask 5)

A small card on each person's tasklist page, and a column for the Scrum Master:

```text
Sprint work left        = Σ (estimate − time spent) over my open sprint tasks         e.g. 22 h
Other work per day      = average time on my daily tasks that are not linked, last 5 days   e.g. 2.5 h
Time available          = working days left × 8 h − (other work per day × working days left)

"About 22 h of sprint work left and 30 h available: roughly 8 h spare."
"About 22 h of sprint work left and 16 h available: roughly 6 h short. Other work is taking 2.5 h a day."
```

It is a hint, not a limit. It is a light first version of Phase 10 (Workload & Capacity), which will replace the fixed 8 hours with real availability, holidays and leave.

---

# 8. The 25 / 50 / 75 Marks (Ask 6)

Marks exist for the **sprint**, for each **function**, and for each function's **Development** and **Documentation** parts: 25 %, 50 %, 75 % and 100 %.

* **Planned date** of a mark: the day expected progress reaches it. A 10-working-day sprint gives 25 % on day 3, 50 % on day 5, 75 % on day 8, 100 % on day 10 (rounded up to a whole day). A function can have an optional start and target date; its marks are then spread over that period instead of the whole sprint. Planned dates are **calculated when needed, not stored**, because sprint dates can be edited (Phase 7) and function dates will be too; a stored date would go stale.
* **Reached date**: the first time actual progress is at or above the mark, recorded when a task's status or time changes. A mark stays reached even if progress later drops (for example when a task is added).
* Each mark shows **early, on time or N days late**.

On the sprint page there is a progress section: a bar with ticks at 25 / 50 / 75, then one row per function with a Development bar, a Documentation bar, its status and its next mark (*"50% due 8 Oct"*, *"25% reached 3 Oct, 1 day late"*). On the tasklist page, a **My features** card shows the same for the functions a person has linked work in, so developers can track their own marks.

---

# 9. Data Changes

```text
SprintTask
  + functionId    String?  → SprintFunction
  + category      String   (Development | Documentation | Testing | Research | Deployment), default Development

SprintFunction
  + startDate     DateTime?   optional, for its own timeline
  + targetDate    DateTime?   optional, defaults to the sprint end

TasklistTask
  + sprintTaskId       String?  → SprintTask   (optional link)
  + spentMins          Int?                    (time actually spent)
  + totalEstimateMins  Int?                    (multi-day work outside the sprint; copied when carried over)

ProgressMark                  (new, one row per mark reached)
  sprintId, functionId?, category?, mark (25 | 50 | 75 | 100), reachedAt
  (planned dates are calculated, not stored)
```

Nothing is removed; existing sprints and tasklists keep working. The snapshots taken at Start Day and End Day also record the link and time spent, so history stays complete.

`spentMins`, `sprintTaskId`, `totalEstimateMins` and the two new categories are the same fields the **Daily Sprint Diary** design needs (D1, D2, D5). They are built once, in this phase's steps 1 to 4. Once progress exists, the diary's header can fill in a line such as *"Sprint 17 — 62% complete, projected finish 14 Oct"* automatically.

---

# 10. Who Sees What

| | Scrum Master | Member |
| --- | --- | --- |
| Sprint and function progress, status, marks | yes | yes |
| Progress and status per person | everyone | only their own |
| "Other work" card | everyone | only their own |
| Set function / work type on a sprint task | yes | no |
| Set function start / target dates | yes | no |
| Link their own daily tasks, log time | yes | yes (own tasks only) |
| Reopen a `DONE` sprint task | yes | no |

Per-person rows are hidden from other Members **on screen only**. Any signed-in member can already read every sprint task and its assignee through the sprint API, which is fine for an internal tool, but it is not a protection and should not be treated as one.

---

# 11. Build Steps

Each step ends with `npm run lint` and `npm run build`, and is checked before the next one starts.

1. **Schema:** the fields in section 9 and the two new categories, in one migration.
2. **Planning:** the task breakdown returns function and work type (with a documentation task per function); saving stores them; the Plan Sprint preview groups by function and shows weights; a way to tag tasks on existing sprints.
3. **Tasklist link:** the optional Sprint task picker (estimate capped at today's hours), badge and group-by-feature; the server checks the task is assigned to the person; optional total estimate for work outside the sprint; **Carry over unfinished tasks** button, keeping the link and total estimate.
4. **Tasklist time:** time spent and the End Day snapshot in one request (pre-filled), "finishes the sprint task" question, automatic `IN_PROGRESS`, the Scrum Master can reopen a `DONE` task, and ended sprints or reassigned tasks keep the time but skip the status change.
5. **Progress calculations:** plain functions in one folder (task, function, work type, person, sprint progress; expected progress; status; forecast), checked with a script against the worked examples in this document.
6. **Progress API:** extend the existing sprint progress endpoint (today it only counts done tasks); record marks whenever a task status or time changes. Role checks as in section 10.
7. **Sprint page:** the progress section, function rows, status, projected finish, people rows for the Scrum Master.
8. **Tasklist page:** the My features card and the other-work card.
9. **Marks:** reached dates recorded, planned dates calculated, early / late labels, optional function dates.
10. **Check and document:** run it against a real sprint, update `README.md`, the PHASE notes and `Internal_Management_System_Completed_Work.md`.

**Order with the Daily Sprint Diary:** steps 1 to 4 give the diary everything it needs (time spent, the link, the categories), so the diary's schema and tasklist steps can be skipped. Suggested order: Phase 8 steps 1 to 4, then the diary, then Phase 8 steps 5 to 10.

---

# 12. Decisions

**Confirmed 30 September 2026: all as recommended.**

| # | Question | Recommendation |
| - | -------- | -------------- |
| P1 | Function weight: a separate AI weight, or the share of estimated hours? | **Share of estimated hours.** The AI's estimates already carry the difficulty; no extra AI call |
| P2 | Add a documentation task for every function automatically? | **Yes**, deletable on the preview, as "every feature has documentation and development" |
| P3 | Progress when nobody links tasks? | **Fall back to sprint task status** (`DONE` = 100 %), with a hint that time is not logged |
| P4 | Who sees delay status per person? | **That person and the Scrum Master.** Sprint and function status is visible to everyone |
| P5 | Status thresholds | **ON TRACK ≥ −5 points, AT RISK down to −15, DELAYED below.** Kept in one place so they are easy to change |
| P6 | Expected progress | **A straight line over working days (Mon–Fri)** now; holidays and leave once time-off records exist |
| P7 | Cap unfinished task progress? | **Yes, at 90 %**, so a task is complete only when someone marks it done |
| P8 | Work types | **Development, Documentation, Testing, Research, Deployment**, shared with the tasklist categories |
| P9 | Build order with the Diary | **Phase 8 steps 1 to 4 first, then the diary** |

---

# 13. Risks and Limits

* **It depends on people logging time.** If few link or log, the numbers stay rough. The fallback in P3 and the hints help; the Scrum Master can see who has not logged.
* **The estimates come from the AI.** If they are far off, weights and progress are off in the same way. The time spent gives a check: functions where spent is far above estimate stand out.
* **A straight line is a crude expectation.** Dependencies (task B cannot start before A) are not used. A later version can plan tasks in dependency order.
* **Two kinds of status.** A daily task and a sprint task each have one. Section 5's rules keep them consistent but it is one more thing to explain.
* **Old sprints have no functions or work types** until the Scrum Master tags them.

---

# 14. How This Fits the Other Phases

* **Phase 10, Workload & Capacity** replaces the fixed 8-hour day and the "other work" hint with real availability, holidays and leave.
* **Phase 11, Sprint Intelligence & Scrum Master Agent** reads the links, progress, status and forecast (asks 4 and 5: agents that follow what the team is working on) to warn early and suggest actions.
* **Phase 12, Sprint Reflection & Learning** uses estimate versus time spent per function and work type for estimation accuracy and recurring overruns.
* **Daily Sprint Diary** reuses the time-spent and link fields and can show sprint progress in its header.
