# SkillPath — Frontend

A standard Next.js (App Router) app — no Framer involved. Hero, the live
courses section, and the footer are plain React components composed on one
page and deployed like any normal site.

## Files

- `lib/logic.ts` — pure, framework-free logic: grouping courses by
  `mainCategory` → `shortCourse`, search filtering, price sorting,
  loading/error/empty/success state derivation, and the footer's copyright
  line. Covered by `lib/__tests__/logic.test.ts` (`bun test`).
- `components/CourseSection.tsx` — client component (`"use client"`) that
  fetches `GET {API_BASE_URL}/api/v1/assignment/course-data`, and renders
  loading (skeletons) / error (message + Retry) / empty / success states.
  Includes search, sort-by-price, grouped rendering, refundable badges, and
  a 3/2/1-column responsive grid.
- `components/Hero.tsx` — headline / subheadline / CTA button, plain props
  with sane defaults (edit the component directly to change copy — no
  property-controls panel needed since this isn't Framer).
- `components/Footer.tsx` — three links + auto-updating copyright year via
  `formatCopyright` from `lib/logic.ts`.
- `app/page.tsx` / `app/layout.tsx` / `app/globals.css` — the App Router
  shell that composes the three components into one page.

## API URL configuration

`CourseSection.tsx` reads `NEXT_PUBLIC_API_BASE_URL`, falling back to the
live deployed backend (`https://skillpath-backend-eo23.onrender.com`) if
that env var isn't set. Set `NEXT_PUBLIC_API_BASE_URL` in your deploy
platform's environment variables if you deploy the backend somewhere else.

## Development

```sh
bun install
bun test              # logic.ts tests
bun run check-types
bun run dev             # http://localhost:3000
bun run build            # production build (also typechecks + lints via Next)
```

## Deploying

This is a standard Next.js app — deploy it anywhere that runs Next.js
(Vercel is the zero-config option: connect the GitHub repo, set the root
directory to `apps/frontend`, done). See
`apps/claude-instruction/claude-deploy.md` for the exact steps taken/needed
for this project.
