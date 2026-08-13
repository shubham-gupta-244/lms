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
   env vars `BASE_URL` (the upstream base) and `PORT`. This lets Render
   auto-detect and configure the service from the repo instead of you
   filling in every field by hand in the dashboard.
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

## After the backend is live: wiring up the frontend

The frontend (`apps/frontend`) is Framer Code Component source, not a
deployable app in this repo — see `apps/frontend/README.md` for the full
paste-into-Framer walkthrough. The one thing you must do once the backend
URL exists:

1. Open `apps/frontend/src/CourseSection.tsx`.
2. Replace the `API_BASE_URL` constant near the top with your Render URL
   from step 5 above.
3. Paste `Hero.tsx`, `CourseSection.tsx`, `Footer.tsx` into Framer as
   separate Code Components (per `apps/frontend/README.md`), place them on
   the canvas in that order, and publish the Framer site.

## Local verification

- `bun test` in `apps/backend`: 19 pass, 0 fail.
- `bun run check-types` in `apps/backend`: clean.
- `docker build` locally: attempted, blocked by this sandbox having no
  outbound network access for Docker's registry pulls (see above) — not
  something I could work around here. First real build will happen on
  Render itself; if it fails, the error will show in Render's build logs
  and is easy to iterate on from there.
