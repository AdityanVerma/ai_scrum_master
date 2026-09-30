# Phase 7 — Authentication & Roles

Phase 7 added **sign-in** and **two roles** to the Internal Management System, and made every screen and API route follow them.

Before this phase anyone who could open the app could do anything: plan sprints (paid AI calls), delete team members, or edit anyone's tasklist. Now:

* Everyone signs in with an email and a password
* The **Scrum Master** (Admin) runs the sprint and the team
* A **Member** works on their own tasklist, their own tasks and their own documents

*Written 30 September 2026, against the code at that date.*

---

# 1. Sign-in ✅

Sign-in is email + password.

* Passwords are hashed with `bcryptjs` (cost 12). The plain password is never stored.
* A wrong email and a wrong password give the same message ("Incorrect email or password."), and take the same time, so the login form cannot be used to find out which emails exist.
* After 5 failed attempts within 15 minutes for the same email from the same address, further attempts are blocked until those 15 minutes are up.
* Passwords must be at least 8 characters and at most 72 bytes (bcrypt ignores anything longer).

There is no email sending. The Scrum Master sets a **temporary password** and passes it on; the member must choose their own at first sign-in.

---

# 2. Sessions ✅

A successful sign-in stores a signed session cookie:

```text
session cookie (httpOnly, 7 days)
└── JWT signed with AUTH_SECRET
    ├── member id
    └── access role
```

The cookie only proves who the person is. **On every request the member is read again from the database**, so:

* A deactivated member is rejected on their very next request, even with a valid cookie
* A changed role takes effect at once (the role in the cookie is never trusted for permissions)

`src/proxy.ts` sends visitors without a session cookie to `/login`. It is a convenience only: it does not check the cookie is genuine. The real checks are inside each API route.

---

# 3. First Scrum Master ✅

Nobody can create the first admin from inside the app, so a one-off script does it:

```bash
npm run create-admin -- --email you@example.com --password "your-password" --name "Your Name"
```

It updates the member with that email or name if one exists, and creates one otherwise.

---

# 4. Temporary Passwords ✅

`TeamMember.mustChangePassword` is `true` for every new member and after every password reset.

While it is `true`, every page sends the member to `/change-password`. Changing the password clears it.

---

# 5. Who Can Do What ✅

| Action                                              | Scrum Master | Member                      |
| --------------------------------------------------- | ------------ | --------------------------- |
| View sprints, team, documentation                   | ✅           | ✅                          |
| Plan a sprint with AI, run the five AI step routes  | ✅           | ❌                          |
| Edit, start and end sprints                         | ✅           | ❌                          |
| Assign tasks (recommended or manual)                | ✅           | ❌                          |
| Change a sprint task's status                       | ✅ any       | ✅ only tasks assigned to them |
| Add, deactivate, reactivate members, reset passwords | ✅           | ❌                          |
| Edit a profile (name, skills)                       | ✅ anyone    | ✅ only their own            |
| Change a job title or sign-in email                 | ✅           | ❌                          |
| Own daily tasklist (create, edit, Start Day, End Day) | ✅           | ✅                          |
| View someone else's tasklist                        | ✅ read only | ❌                          |
| Add documentation                                   | ✅           | ✅                          |
| Edit / delete documentation                         | ✅ any       | ✅ only their own            |

The Daily Sprint Diary (Scrum Master only) is designed in a later step.

---

# 6. Where the Checks Live ✅

```text
Browser
   │
   ▼
proxy.ts ──── no cookie? ──► /login          (convenience only)
   │
   ▼
API route
   │
   ├── requireSession()        signed in and active?          401
   ├── requireRole(...)        Scrum Master?                  403
   └── ownership check         their tasklist / task / doc?   403
   │
   ▼
Database
```

* `src/lib/auth/session.ts`: creates, reads and deletes the session cookie
* `src/lib/auth/dal.ts`: `getCurrentMember()`, `requireSession()`, `requireRole()`
* `src/lib/auth/tasklist-access.ts`: owner writes, Scrum Master reads
* `src/app/api/documents/[id]/route.ts`: author or Scrum Master

Every route under `src/app/api` was checked by hand; only `auth/login` and `auth/logout` are open, on purpose.

Password hashes are left out of every `TeamMember` query by default (`omit` in `src/lib/prisma.ts`). Only sign-in and change-password ask for them.

---

# 7. Team Management ✅

The Team page (`/team-members`) gives the Scrum Master:

* **Add Member**: name, email, job title, skills, access (Member or Scrum Master) and a temporary password with a Generate button. The sign-in details are shown once, with a Copy button.
* **Reset Password**: sets a new temporary password.
* **Deactivate / Reactivate**: a deactivated member cannot sign in and is signed out on their next request. Their tasks, tasklists and documents are kept.
* **Delete**: offered on deactivated members, and refused when the member has sprint tasks, tasklists or documents. It is for someone added by mistake; everyone else is deactivated so their history stays intact.

The Scrum Master cannot deactivate, delete or reset **their own** account. Because the person doing it is always an active Scrum Master, this also guarantees at least one active Scrum Master remains.

Deactivated members are left out of assignment recommendations and the assign dropdown.

---

# 8. Member Profile ✅

Each member has a profile page at `/team-members/[id]`, opened from the header name or the Team page.

* A member edits their own name and skills
* The Scrum Master edits anyone, including job title and sign-in email
* Setting an email gives an older member (added before sign-in existed) a way to sign in: set the email, then use Reset Password

---

# 9. Sprint Lifecycle ✅

```text
PLANNED ──Start Sprint──► ACTIVE ──End Sprint──► COMPLETED
└───── Edit Sprint allowed ─────┘                 (read only)
       (name, goal, dates)
```

* **Edit Sprint**: name, goal and dates of planned and active sprints. Completed and cancelled sprints are locked.
* **Several sprints may be active at once.** Starting a sprint while another is still active asks first: *"Sprint A is still active with 4 unfinished tasks. Start Sprint B alongside it?"* Leftover work is finished as overtime or reassigned.
* **Overtime badge**: an active sprint past its end date shows *"Overtime: N days, M unfinished"* on its page and in the sprints list.
* **End Sprint** is always the Scrum Master's decision; passing the end date never closes a sprint. The confirmation shows how many tasks are unfinished. Unfinished tasks **stay in the ended sprint**, recorded as unfinished, and nobody can change their status or assignee afterwards.

---

# 10. Documents: Edit and Delete ✅

* Edit (title, type, content or link, tags, sprint) and Delete, each with the author or Scrum Master rule
* Each document records who added it (`Document.createdById`); cards show "Added by …"
* Documents added before sign-in have no author, so only the Scrum Master can change them
* Links must start with `http://` or `https://`, so a `javascript:` link cannot be saved

---

# 11. Tasklists per Person ✅

* Everyone opens **their own** tasklist for today
* **Create Today's Tasklist** appears when there is none yet
* The Scrum Master has a member picker; other people's lists open read only
* "Today" is the viewer's local date

---

# 12. Screens Follow the Role ✅

Buttons a person cannot use are hidden (Plan Sprint, Create New Sprint, Edit / Start / End Sprint, Assign, Recommend, Team controls, other people's document actions).

A Member who opens Plan Sprint by its URL sees a shared **Not allowed** page (`src/components/auth/NotAllowed.tsx`).

Hidden buttons are for convenience; the API refuses the same actions regardless.

---

# 13. Fixes Made Along the Way

* Assignment and task status routes checked the sprint **after** writing, so a wrong sprint id still changed the task
* A subtask could point at a task in another member's tasklist
* Deactivated members were still recommended for assignment
* `+ Add Subtask` stayed clickable after End Day
* The tasklist page used the UTC date, so before 5:30 am in India it showed yesterday
* Add Document showed "Failed to process document." instead of the actual reason

---

# 14. API Reference (added or changed)

| Route                                           | Method       | Who                          |
| ----------------------------------------------- | ------------ | ---------------------------- |
| `/api/auth/login`, `/api/auth/logout`           | POST         | Anyone                       |
| `/api/auth/me`                                  | GET          | Signed in                    |
| `/api/auth/change-password`                     | POST         | Signed in                    |
| `/api/team-members`                             | POST         | Scrum Master                 |
| `/api/team-members/[id]`                        | PATCH        | Self or Scrum Master         |
| `/api/team-members/[id]`                        | DELETE       | Scrum Master                 |
| `/api/team-members/[id]/access`                 | PATCH        | Scrum Master (not on self)   |
| `/api/team-members/[id]/reset-password`         | POST         | Scrum Master (not on self)   |
| `/api/sprints/[id]`                             | PATCH        | Scrum Master                 |
| `/api/sprints/[id]/complete`                    | PATCH        | Scrum Master                 |
| `/api/sprints/[id]/tasks/[taskId]/status`       | PATCH        | Scrum Master or the assignee |
| `/api/documents/[id]`                           | PATCH, DELETE | Author or Scrum Master      |

All other routes need a signed-in member; the AI planning and assignment routes need the Scrum Master.

---

# 15. Known Limitations

* **Resetting a password does not sign the member out** of browsers where they are already signed in, and reactivating a member makes their old cookie work again until it expires (7 days). Deactivating is the way to lock someone out immediately. Fixing this needs one extra column (a "sessions valid after" time).
* The failed sign-in limit is kept in memory: it resets when the server restarts and is not shared between several servers.
* No email: temporary passwords are passed on by hand.
* A member cannot be promoted or demoted in the UI (the create-admin script can promote).
* Skill changes by members are not reviewed by the Scrum Master, although skills drive assignment recommendations.
* There is no activity log of Scrum Master actions.
* Changing `AUTH_SECRET` signs everyone out.

---

# Phase 7 — Complete Status

| **Feature**                                   | **Status** |
| --------------------------------------------- | ---------- |
| Email + password sign-in                      | ✅ Done     |
| Session cookie, member re-read every request  | ✅ Done     |
| Failed sign-in limit                          | ✅ Done     |
| First Scrum Master script                     | ✅ Done     |
| Temporary password + forced change            | ✅ Done     |
| Every API route protected                     | ✅ Done     |
| Add / deactivate / reset / delete members     | ✅ Done     |
| Member profile                                | ✅ Done     |
| Edit sprint                                   | ✅ Done     |
| End sprint, overtime, parallel sprints        | ✅ Done     |
| Edit / delete documents                       | ✅ Done     |
| Own tasklist, create today's tasklist         | ✅ Done     |
| Screens follow the role, Not allowed page     | ✅ Done     |
| Automated permission checks per role          | ✅ Done     |
| Browser click-through test                    | ⏳ Pending  |

---

## Phase 7 Checkpoint

**Phase 7 — Authentication & Roles: 🟢 Complete, pending the browser test pass**

The next piece of work is the **Daily Sprint Diary** (Scrum Master only), which builds on the roles and the per-person tasklists from this phase.
