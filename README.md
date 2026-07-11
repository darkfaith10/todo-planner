# Scope — a todo planner across four time scales

A single-page React app with four collapsible todo lists — **Daily** (open by
default), **Weekly**, **Monthly**, and **Yearly**. Click a task to check it
off (it gets struck through and moves out of the main list); a "Show
completed" toggle in each section brings finished tasks back into view.

Every task is tied to a real date. Use the calendar icon top-right to jump
to any date in the year — weekly, monthly, and yearly lists follow along
(weeks run **Monday–Sunday**). Above the Daily list, a day strip shows the
day before and after the selected date so you can quickly step forward to
plan ahead or back to check what you had going on.

Data is stored in **MongoDB Atlas**. There is **no separate backend server**
to host — reads and writes go through small **Vercel Serverless Functions**
in the `/api` folder, deployed automatically alongside the frontend on
Vercel. This is what avoids the slow cold-start you were seeing with a
Render-hosted backend: there's nothing else to spin up, and Vercel keeps the
MongoDB connection cached across warm invocations of the same function.

## 1. Create a free MongoDB Atlas cluster

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and
   create a free (M0) cluster.
2. Under **Database Access**, create a user with a username/password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) so
   Vercel's functions can reach it.
4. Click **Connect → Drivers** and copy the connection string, it looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```

You don't need to create the database or collection manually — the API
creates them automatically on the first insert.

## 2. Local development

```bash
npm install
cp .env.example .env   # then paste your connection string into .env
```

To run the full app locally (frontend + API functions together), use the
Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

This serves the React app and the `/api` functions on the same port with
your `.env` values loaded, exactly like production.

(If you only want the frontend with hot-reload and don't need the API,
`npm run dev` runs Vite alone on port 5173 — the `vite.config.js` proxy
assumes `vercel dev` is also running on port 3000 for `/api` calls.)

## 3. Deploy to Vercel

1. Push this project to a GitHub repo.
2. In the [Vercel dashboard](https://vercel.com/new), import the repo.
3. Vercel auto-detects the Vite frontend and the `/api` functions — no extra
   config needed beyond what's in `vercel.json`.
4. Under **Project Settings → Environment Variables**, add:
   - `MONGODB_URI` — your Atlas connection string
   - `MONGODB_DB` — (optional) database name, defaults to `scope-planner`
5. Deploy. That's it — frontend and API ship together, and every load is a
   fresh, fast serverless invocation instead of waiting on an idle backend
   to wake up.

## Project structure

```
├── api/
│   ├── _db.js       # cached MongoDB connection, reused across warm invocations
│   └── todos.js      # GET/POST/PATCH/DELETE for todos, one function for all scopes
├── src/
│   ├── api.js        # tiny fetch wrappers used by the frontend
│   ├── App.jsx        # top-level state + data flow
│   ├── index.css      # design system (ink background, per-scope accent colors)
│   └── components/
│       ├── ScopeIcon.jsx   # concentric-ring icon (rings grow with zoom level)
│       ├── TodoSection.jsx # one collapsible list (daily/weekly/monthly/yearly)
│       └── TodoItem.jsx    # a single row: check off, strike through, delete
├── index.html
├── vite.config.js
└── vercel.json
```

## Notes on the data model

Each todo is a single MongoDB document, tied to a specific period via a
`date` **anchor**:

```json
{
  "_id": "…",
  "scope": "daily",     // "daily" | "weekly" | "monthly" | "yearly"
  "date": "2026-07-11",  // anchor date for the period (see below)
  "text": "Ship the deploy",
  "completed": false,
  "createdAt": "2026-07-10T09:00:00.000Z"
}
```

The anchor date means different things per scope:

- **daily** — the exact day the task belongs to
- **weekly** — the **Monday** of that (Monday–Sunday) week
- **monthly** — the 1st of that month
- **yearly** — Jan 1st of that year

Picking a date (via the calendar icon top-right, or the day-strip arrows
above the Daily list) recomputes all four anchors from that date and
refetches each list. Stepping a day only reloads Weekly/Monthly/Yearly if
you actually crossed into a new week, month, or year — otherwise they stay
put.

Lists are manual, not auto-archived — completed tasks stay (struck through,
hidden behind "Show completed") until you delete them.
