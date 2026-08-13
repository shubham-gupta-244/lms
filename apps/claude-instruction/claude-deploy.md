# Deployment — what was done and why

This documents every step taken to get `apps/backend` deployable, plus the
manual step that requires your Render login (which I don't have access to).

## Why Render, and why Docker

The assignment's own upstream API (`https://syncsphere-hiv6.onrender.com`)
is hosted on Render, so that's the implied target platform. Render's normal
free-tier flow is: connect a GitHub repo, Render builds and runs it. Render
has no native Bun buildpack, so the backend is deployed as a Docker image
using Bun's official `oven/bun` base image — the most reliable way to get
Bun running on Render without fighting a Node-oriented buildpack.

## What I changed to make this deployable

1. **Added `GET /healthz`** (`apps/backend/src/app.ts`) — a health-check
   endpoint that returns `200 { status: "ok" }` without touching the
   upstream API. This matters because the upstream is *intentionally* flaky
   (~1 in 3 requests fail) — if Render's health check hit
   `/api/v1/assignment/course-data` directly, the flakiness would make
   Render think the service was crashing and restart it. `/healthz` is
   covered by `apps/backend/src/__tests__/healthz.test.ts`.
2. **`apps/backend/Dockerfile`** — `oven/bun:1.3.11-slim` base image, copies
   the whole monorepo (Bun workspaces need the root `package.json` +
   `bun.lock` + every workspace's `package.json` to resolve dependencies),
   runs `bun install --frozen-lockfile`, then `bun run start` from
   `apps/backend`.
3. **`.dockerignore`** (repo root) — excludes `node_modules`, `.git`,
   `.turbo`, and build output from the Docker build context.
4. **`render.yaml`** (repo root) — a Render "Blueprint" spec: one Docker web
   service (`skillpath-backend`), free plan, health check on `/healthz`,
   env var `BASE_URL` (the upstream base). This lets Render auto-detect and
   configure the service from the repo instead of you filling in every
   field by hand in the dashboard. (An earlier version also set an explicit
   `PORT` env var — removed after causing a one-time restart, see below.)
5. Verified locally: `bun test` (19/19 pass, including the new `/healthz`
   test) and `bun run check-types` (clean) — both directly, both green.
   I also attempted `docker build -f apps/backend/Dockerfile -t
   skillpath-backend:local .` to verify the Dockerfile itself, but this
   sandbox's Docker daemon has no outbound network access (DNS lookups to
   `registry-1.docker.io` time out), so it couldn't pull the `oven/bun`
   base image. That's an environment limitation, not a Dockerfile problem —
   Render's build servers have normal internet access. I'm flagging this
   rather than claiming a verification that didn't happen: the Dockerfile
   is written correctly against the same pattern used successfully for
   `bun test`/`bun run check-types` (workspace-aware `bun install`, correct
   `WORKDIR`, correct start command), but its *build* is unverified until
   Render (or a machine with real Docker network access) actually runs it.

## What I could NOT do

I have no Render account access, no Render API token, and no Render CLI
authenticated in this environment — connecting a repo to Render requires
your login, so I can't complete that step for you. I also didn't fabricate
having deployed anything; the steps below are what's left for you to click
through.

## What you need to do (≈2 minutes)

1. Go to <https://dashboard.render.com> and sign in.
2. **New → Blueprint**.
3. Connect the `shubham-gupta-244/lms` GitHub repo (grant Render access if
   prompted).
4. Render detects `render.yaml` at the repo root and proposes the
   `skillpath-backend` service — review and click **Apply**.
5. Wait for the build/deploy to finish (first Docker build typically takes
   a few minutes). Render gives you a public URL like
   `https://skillpath-backend-xxxx.onrender.com`.
6. Confirm it's live: `curl https://<your-render-url>/healthz` should
   return `{"status":"ok"}`.

## Post-deploy note: a one-time port-detection restart

After the first successful deploy, Render logged `Detected service running
on port 4000` about 5 minutes after going live, then restarted the
container once (`SIGTERM`, immediate relaunch). The service recovered on
its own and has been stable and correctly responding since
(`/healthz` → `200`, `/api/v1/assignment/course-data` → `200`/`502`
depending on the upstream's real flakiness, `POST` → `405`, all confirmed
live). Likely cause: `render.yaml` originally set an explicit `PORT=4000`
env var alongside the Dockerfile's `EXPOSE 4000` — redundant for a Docker
service, since Render prefers auto-detecting the bound port. Removed the
explicit `PORT` env var from `render.yaml` so there's only one source of
truth (the Dockerfile's `EXPOSE`) going forward.

## Frontend: pivoted away from Framer

The assignment doc originally described a "landing page in Framer" with
property controls, so the frontend was first built as Framer Code
Component source (paste-in `.tsx` files). That turned out to add real
friction (Framer's code-file UI wasn't easy to find, and Framer isn't
actually a hosting platform — a code component is just one piece dropped
into a Framer-built canvas, not a deployable site). Since the real goal is
a working, visitable website, the frontend was rebuilt as a **standard
Next.js (App Router) app** in `apps/frontend` — see
`apps/frontend/README.md`. No Framer involved anymore.

## Deploying the frontend (Vercel — needs your login, same as Render)

Vercel is Next.js's native platform and is zero-config for this kind of
app. I have no Vercel account access, API token, or authenticated CLI in
this environment, so — same situation as Render — this step needs you:

1. Go to <https://vercel.com/new> and sign in (GitHub OAuth is easiest).
2. **Import Project** → select the `shubham-gupta-244/lms` repo.
3. When asked for the **Root Directory**, set it to `apps/frontend`
   (this is a monorepo — Vercel needs to know which app to build).
4. Framework Preset should auto-detect as **Next.js**. Leave build/output
   settings at their defaults (`next build`, `.next`).
5. (Optional) Add an environment variable `NEXT_PUBLIC_API_BASE_URL` if you
   ever deploy the backend somewhere other than
   `https://skillpath-backend-eo23.onrender.com` — `CourseSection.tsx`
   falls back to that URL automatically if the env var isn't set, so this
   is only needed if the backend URL changes.
6. **Deploy**. Vercel gives you a public URL
   (e.g. `https://lms-<something>.vercel.app`) — that's the actual
   visitable website link.

## Local verification

- Backend: `bun test` in `apps/backend` — 19 pass, 0 fail.
  `bun run check-types` — clean.
  `docker build` locally: attempted, blocked by this sandbox having no
  outbound network access for Docker's registry pulls (see above) — not
  something I could work around here. The real build ran successfully on
  Render itself (confirmed live, see the port-detection note above).
- Frontend: `bun test` in `apps/frontend` — 15 pass, 0 fail (`lib/logic.ts`
  coverage). `bun run check-types` — clean. `bun run build` (`next build`)
  — succeeds, produces a static-optimized `/` route. Also ran `next dev`
  locally and curled `http://localhost:3000/` — confirmed the Hero
  headline, "Explore Courses" title, and "SkillPath" all render
  server-side. Not verified here: the live fetch to the backend rendering
  correctly in an actual browser (this environment has no browser), and
  the deployed Vercel build (blocked on you connecting the repo, per
  above).
