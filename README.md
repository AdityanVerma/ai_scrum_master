# AI Scrum Master

Internal management tool for OsmosisLearn. It helps plan sprints with AI, assign tasks to the right team members, track each person's daily tasklist, and keep project documentation in one place.

## What it does

- **Dashboard** (`/`): entry point to the tool.
- **Plan Sprint** (`/sprint-proposal`): describe a sprint and let the AI turn it into requirements, tasks, skills, dependencies and estimates, then save it as a sprint.
- **Sprints** (`/sprints`): list of sprints; each sprint page shows progress, tasks, assignments (recommended or manual) and its documents.
- **Team** (`/team-members`): team members and their skills.
- **Tasklist** (`/tasklist`): a daily tasklist per team member with subtasks, capacity check, and start-of-day / end-of-day snapshots.
- **Documentation** (`/documentation`): documents, links and notes, optionally tied to a sprint.

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
   ```

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

5. Start the dev server and open [http://localhost:3000](http://localhost:3000):

   ```bash
   npm run dev
   ```

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

- `src/app`: pages and API routes.
- `src/components`: shared UI (`layout`, `tasklist`, `documents`).
- `src/lib`: database helpers (`db`), AI planning steps (`ai`), assignment logic (`assignment`), and small utilities.
- `prisma`: schema and migrations. The generated client lives in `src/generated/prisma`.
- `_docs_`: project documentation. Start with `_docs_/PLAN` for the pain points, phases and per-phase notes.
- `TODO.md`: the current clean-up checklist.

## Notes

- Styling uses shared classes defined in `src/app/globals.css` (`card`, `btn-primary`, `input`, `badge`, and so on) and the colour tokens at the top of that file. Reuse them instead of adding one-off colours.
- File upload for documents is not built yet; documents can be pasted content or links.
- This Next.js version has breaking changes from older releases. See `AGENTS.md` and `node_modules/next/dist/docs/` before writing Next.js code.
