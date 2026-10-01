# AI Scrum Master

Internal management tool for OsmosisLearn. It helps plan sprints with AI, assign tasks to the right team members, track each person's daily tasklist, and keep project documentation in one place.

## What it does

- **Sign in** (`/login`): email and password. New members get a temporary password and choose their own at first sign-in (`/change-password`).
- **Dashboard** (`/`): entry point to the tool.
- **Plan Sprint** (`/sprint-proposal`, Scrum Master): describe a sprint and its functions (features) and let the AI turn them into tasks, each with a function, a work type, skills, dependencies and an estimate, plus one documentation task per function. The preview groups tasks by function and shows each function's weight (its share of the estimated hours). Remove any task you do not want, then save the sprint; nothing is saved before that.
- **Sprints** (`/sprints`): list of sprints; each sprint page shows progress, tasks grouped by function, assignments (recommended or manual) and its documents. The Scrum Master edits, starts and ends sprints, and sets each task's function and work type (for sprints planned before tasks had them); several can be active at once, and an active sprint past its end date shows an Overtime badge.
- **Team** (`/team-members`): team members and their skills, with a profile page per member. The Scrum Master adds members, deactivates them and resets passwords.
- **Tasklist** (`/tasklist`): each member's daily tasklist with subtasks, capacity check, and start-of-day / end-of-day snapshots. A task can be linked to one of your sprint tasks (optional; shown as a `Feature · TASK-003` badge, and the list can be grouped by feature), and work outside the sprint can have a total estimate across days. **Carry Over Unfinished** copies the previous day's unfinished tasks. **End Day** asks for the time spent on each task (and whether a linked sprint task is finished), then locks the list; time logged on a sprint task moves it to In Progress. The Scrum Master can view anyone's, read only.
- **Documentation** (`/documentation`): documents, links and notes, optionally tied to a sprint. The author or the Scrum Master can edit and delete them.

## Roles

| Scrum Master | Member |
| --- | --- |
| Everything a Member can do, plus: plan sprints with AI, edit / start / end sprints, assign tasks, reopen a done sprint task, manage the team, edit anyone's profile, view anyone's tasklist (read only), edit or delete any document | Own tasklist, own profile (name and skills), status of tasks assigned to them, add documents and edit or delete their own |

Permissions are checked inside every API route; hidden buttons are only a convenience. The full rules are in `_docs_/PLAN/SUB-PHASES/PHASE-7.md`.

## Tech stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Prisma 7 with PostgreSQL, Zod, and the OpenAI SDK pointed at OpenRouter.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with:

   ```bash
   DATABASE_URL=            # PostgreSQL connection string used by the app
   PRISMA_DATABASE_URL=     # PostgreSQL connection string used by the Prisma CLI
   OPENROUTER_API_KEY=      # key used for the AI sprint planning steps
   AUTH_SECRET=             # random secret (32+ characters) used to sign login sessions
   DATABASE_POOL_MAX=       # optional; set to 1 with the local `prisma dev` database
   ```

   The local `prisma dev` database drops connections when several are open at once, which shows up as "Connection terminated unexpectedly". `DATABASE_POOL_MAX=1` avoids it. Leave it unset for a normal PostgreSQL server.

   Generate a value for `AUTH_SECRET` with:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   Keep it private and use a different value in each environment. Changing it signs everyone out.

3. Generate the Prisma client and apply the migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Create the first Scrum Master (Admin). Nobody can create the first admin from inside the app, so run this once. It updates the member with that name (or email) if one exists, and creates it otherwise:

   ```bash
   npm run create-admin -- --email you@example.com --password "your-password" --name "Your Name"
   ```

5. Start the dev server, open [http://localhost:3000](http://localhost:3000) and sign in with that account:

   ```bash
   npm run dev
   ```

   Add the rest of the team from the Team page. Each person gets a temporary password to pass on, and chooses their own at first sign-in.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the code with Prettier |
| `npm run create-admin -- --email ... --password ... --name ...` | Create or update the Scrum Master account |

## Project layout

- `src/app`: pages and API routes. `src/proxy.ts` sends signed-out visitors to `/login`.
- `src/components`: shared UI (`layout`, `auth`, `team`, `sprints`, `sprint-proposal`, `tasklist`, `documents`).
- `src/lib`: sign-in and permission checks (`auth`), database helpers (`db`), AI planning steps (`ai`), assignment logic (`assignment`), and small utilities.
- `prisma`: schema and migrations. The generated client lives in `src/generated/prisma`.
- `_docs_`: project documentation. Start with `_docs_/PLAN` for the pain points, phases and per-phase notes.
- `TODO.md`: the current clean-up checklist.

## Notes

- Styling uses shared classes defined in `src/app/globals.css` (`card`, `btn-primary`, `input`, `badge`, and so on) and the colour tokens at the top of that file. Reuse them instead of adding one-off colours.
- File upload for documents is not built yet; documents can be pasted content or links.
- This Next.js version has breaking changes from older releases. See `AGENTS.md` and `node_modules/next/dist/docs/` before writing Next.js code.
