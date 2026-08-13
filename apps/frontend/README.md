# SkillPath — Frontend (Framer Code Component)

This isn't a runnable app — Framer Code Components are single self-contained
`.tsx` files pasted into Framer's own code editor, where Framer supplies the
`framer` runtime module (`addPropertyControls`, `ControlType`, etc.). What
lives in this folder is the source of that file plus the logic it's built on,
kept testable with Bun.

## Files

- `src/logic.ts` — pure, framework-free logic: grouping courses by
  `mainCategory` → `shortCourse`, search filtering, price sorting,
  loading/error/empty/success state derivation, and the footer's copyright
  line. Covered by `src/__tests__/logic.test.ts` (`bun test`).
- `src/CourseSection.tsx` — the courses-section Framer Code Component. A thin
  shell around `logic.ts` that handles fetching, rendering, styling, and its
  two property controls (Accent Color, Section Title).
- `src/Hero.tsx` — headline / subheadline / CTA button, four property
  controls (Headline, Subheadline, Button Label, Accent Color) so a designer
  can rewrite the copy without touching code.
- `src/Footer.tsx` — three links + a copyright line that auto-fills the
  current year via `formatCopyright` from `logic.ts`. Property controls:
  Brand Name, Links (array of label/url pairs), Accent Color.
- `src/framer.d.ts` — ambient types for the `framer` module (`ControlType`,
  `addPropertyControls`) purely so `bun run check-types` can typecheck these
  files in this repo; inside Framer itself, `framer` resolves to Framer's
  real runtime.

None of these files can actually *run* outside Framer — they're the source
that gets pasted into Framer's code editor, one file per Code Component.

## Using it in Framer

1. `apps/backend` is deployed at `https://skillpath-backend-eo23.onrender.com`
   and `src/CourseSection.tsx`'s `API_BASE_URL` already points there
   (deliberately not a property control — it's infra config, not something
   a designer should be able to break from the panel). If you redeploy the
   backend elsewhere, update that constant to match.
3. In Framer: **Insert → Code → New Code File**, once per component
   (`CourseSection.tsx`, `Hero.tsx`, `Footer.tsx`), paste each file's
   contents, and drag the resulting components onto the canvas in order:
   Hero → CourseSection → Footer.
4. Each component exposes its own property controls in the right-hand panel:
   - **CourseSection** — Accent Color (buttons, hover states, the refundable
     badge, search-focus ring), Section Title (heading above search/sort).
   - **Hero** — Headline, Subheadline, Button Label, Accent Color.
   - **Footer** — Brand Name, Links (add/remove/reorder label+URL pairs),
     Accent Color.

All three share the same dark-purple/white/black palette tokens so the page
reads as one system even though each is a separate pasted-in file.

## Grid behavior

3 columns on desktop, 2 on tablet (≤1024px), 1 on mobile (≤640px), via CSS
Grid breakpoints in `CourseSection.tsx` — no assumption about the exact
course count, since the upstream API returns 5–10 courses per call.

## What's verified here vs. only verifiable in Framer

- Verified by `bun test` / `bun run check-types` in this repo: grouping,
  filtering, sorting, and loading/error/empty/success state derivation
  (`logic.ts`), plus that `CourseSection.tsx` typechecks.
- **Not** verifiable outside Framer: the property-controls panel actually
  rendering and updating live, and on-canvas responsive behavior. Paste the
  component into a real Framer project to check those.
