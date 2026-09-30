# Daily Sprint Diary — Design

*Design only; nothing here is built yet. Written 30 September 2026 from the sample diaries in `_data_/sprintDiary.data.txt` (Aug 19 to Sep 29) and tasklists in `_data_/tasklists.data.txt`. Decisions confirmed the same day, all as recommended.*

*Build order: the time spent, the sprint-task link, the total estimate and the new categories (D1, D2, D5) are built in **Phase 8 steps 8.1 to 8.4** (`_docs_/PLAN/SUB-PHASES/PHASE-8.md`). The diary is built after them, with the steps in section 6.*

---

# 1. What the Diary Is Today

Every working day the Scrum Master posts a **Sprint Diary** in Google Chat. It is typed by hand, mostly by copying everyone's tasklist into one message:

```text
Sprint Diary: Aug 19
Phase 3: [Web] NextJS implementation & new features with AI        ─┐
MACRO-SCOPE - Phase level                                            │
  Sprint 14 [Phase 3.3] - <features> - Released on 10/8, fixes       │  Header
  Sprint 15 [Phase 3.4] - <features> - Development ongoing           │  (changes
MICRO-SCOPE - Sprint level                                           │   slowly,
  Previous sprint: Sprint 14 - pending issues ...                    │   typed by
  Current sprint: Sprint 15 - Delayed                                │   the Scrum
  Planned INTERNAL release to UAT: Aug 20, Aug 21                    │   Master)
  Release to pre prod: Aug 20, Aug 22                                │
STATUS : RED                                                        ─┘
Member A:                                                           ─┐
  Yesterday                                                          │
  1. [Development] Admin must not delete ... - 2hr [2hr/3hr]         │  People
  Today                                                              │  (one block
  1. [Meeting] Buddy & Scrum Calls - 1hr [1hr/1hr]                   │   per person,
  2. [Documentation] User Profiling - 2hr [2hr/10hr]                 │   from their
     2.1 Dependency Chart - 2hr [2hr/3hr]                            │   tasklists)
Member B:                                                            │
  Today [To be updated]                                             ─┘
Public Holiday: Member A, Member B, Member C - Aug 28                ─┐ Time off
Leave: Member D - Aug 25 - 28                                        ─┘
```

Reading of a task line: `[Category] Title - <time today> [<total time spent so far> / <total estimate>]`.

* The same piece of work runs over several days (`Polls Implementation - 4Hr [17Hr/18Hr]`, next day `2Hr [19Hr/18Hr]`), so the totals are **across days**, and they can go **over** the estimate.
* Meetings show `[1hr/1hr]`; short one-off items often have no totals at all.
* Milestone dates slip and the old dates are kept: `Planned internal release to UAT: Sept 1, Sept 4`.
* Status is `RED`, `ORANGE` or `GREEN`.

**The slow part is the people blocks**: collecting and retyping every person's Yesterday and Today. That is what the app should generate.

---

# 2. What the App Already Has

| Diary part                  | Already in the app                                          | Missing                                                    |
| --------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------- |
| Yesterday / Today per person | Daily tasklists with tasks, subtasks, category, estimate, status, SOD/EOD snapshots | **Time actually spent**; **totals across days**           |
| Categories                  | Development, Testing, Documentation, Meeting, Non-sprint    | **Research**, **Deployment** (both used in the diaries)    |
| Previous (overtime) sprints | Several active sprints, Overtime badge, unfinished counts    | Nothing: can be generated                                  |
| Current sprint              | Sprint name, goal, dates, status                            | Milestones (internal release, UAT, pre-prod, live) with slipped dates |
| Phase / macro scope         | Nothing                                                     | Phase text, one line per sprint                            |
| Status RED/ORANGE/GREEN     | Nothing                                                     | Per diary                                                  |
| Holidays and leave          | Nothing                                                     | Time-off records                                           |

---

# 3. Proposed Diary

A Scrum Master page, **`/sprint-diary`**, one diary per date:

```text
┌─ Header (Scrum Master edits; each new diary starts as a copy of the previous one)
│    Phase ................. text
│    Macro scope ........... text, pre-filled with one line per active sprint
│    Micro scope ........... text
│    Status ................ RED / ORANGE / GREEN
│
├─ Overtime sprints (generated)
│    "Previous sprint: Sprint 15 - 6 days over, 4 unfinished tasks"
│
├─ People (generated from tasklists, active members only)
│    Yesterday = the member's latest tasklist before the diary date
│                (so Monday shows Friday, and days off are skipped)
│    Today     = the member's tasklist for the diary date,
│                or "[To be updated]" if they have not created it
│
├─ Time off (generated from time-off records, upcoming only)
│
└─ [Copy for Google Chat]   [Publish]
```

* **Copy for Google Chat** copies the diary as plain text in today's format, so the team sees no change except that it is complete and on time.
* **Publish** saves that exact text with the date. Published diaries are listed and never change afterwards, even if a tasklist is edited later.
* Members cannot open the page (the shared Not allowed page), matching the role table.

---

# 4. Data Changes

```text
Built in Phase 8 (step 8.1):
  TasklistTask
    + spentMins         Int?      time actually spent that day (decision D1)
    + sprintTaskId      String?   optional link to a sprint task (decision D2)
    + totalEstimateMins Int?      estimate for multi-day work that is not a sprint task (D2)
  Task categories: + Research, + Deployment   (decision D5)

Built with the diary:
  TimeOff                        (decision D4)
    memberId, type (LEAVE | PUBLIC_HOLIDAY), startDate, endDate, note

  SprintDiary
    date (unique), phase, macroScope, microScope, status (RED | ORANGE | GREEN),
    publishedText, publishedAt, publishedById
```

How the totals in `[spent / estimate]` would be worked out:

```text
Linked to a sprint task?
  yes → total estimate = the sprint task's estimate
        total spent    = all logged time on tasklist tasks linked to that sprint task
  no  → follow the carry-forward chain (yesterday's task → today's copy)
        total estimate = totalEstimateMins on the chain (copied when carried)
        total spent    = logged time along the chain
  neither → show only the time for the day, as the diaries already do for one-off items
```

Carry-forward already exists in the API but has **no button yet**; the "Carry over unfinished tasks" button is built in Phase 8 step 8.3.

---

# 5. Decisions

**Confirmed 30 September 2026: all as recommended.**

| #  | Question | Recommendation |
| -- | -------- | -------------- |
| D1 | Log **time actually spent** per task? | **Yes.** Ask at End Day, one field per task, pre-filled with the estimate so it is one click when the estimate was right. Without it the diary cannot show overruns like `[25hr/15hr]`. |
| D2 | Where do the **totals across days** come from? | **Link to a sprint task when it is sprint work** (pick from "my sprint tasks" when adding a tasklist task); **carry-forward** for other multi-day work, with its own total estimate. One-off items just show the day's time. |
| D3 | **Header**: structured milestones with date history, or text? | **Text for now**, pre-filled from the previous diary. The Scrum Master already writes it this way and it changes slowly. Structured milestones (with slipped-date history) can come with Phase 8 (25/50/75% checks). |
| D4 | **Holidays and leave** as records, or text in the header? | **Records** (who, from, to, type), entered by the Scrum Master. The diary lists upcoming ones, and Phase 10 (workload and capacity) will need them anyway. |
| D5 | New task **categories**? | Add **Research** and **Deployment**; both appear in the diaries. |
| D6 | Status colours? | **RED / ORANGE / GREEN**, as the team already uses (the TODO said AMBER). |
| D7 | Keep **published** diaries? | **Yes**, as the exact text that was posted, listed by date. |

---

# 6. Build Steps (after Phase 8 steps 8.1 to 8.4)

Time spent, the sprint-task link, the carry-over button and the new categories come from Phase 8 steps 8.1 to 8.4. The diary itself needs:

1. **Schema**: `TimeOff` and `SprintDiary` from section 4, one migration.
2. **Time off**: Scrum Master adds public holidays and leave (on the Team page).
3. **Diary API**: builds the diary for a date (header, overtime sprints, people, time off), saves the header, and publishes it. Scrum Master only.
4. **Diary page**: `/sprint-diary` with the header form, the live preview, Copy for Google Chat, Publish, and past diaries. Header link for the Scrum Master; the Not allowed page for Members.
5. **Check against the samples**: generate diaries for a few test days and compare with the real ones in `_data_/`; tests per role; README and PHASE notes.

Each step ends with `npm run lint` and `npm run build`, as before.
