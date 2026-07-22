# CLAUDE.md

Guidance for working in this repo. Read before making changes.

## What this is

A single premium, scroll-driven landing page for **The Mustang**, a Nepalese
restaurant and bar in Farrer, Canberra. The signature interaction is a fixed,
full-screen **native video that the visitor scrubs by scrolling** (scroll
position drives `video.currentTime`). Below that cinematic act, the page lands
on solid sections with the real menu, story, services, FAQ and reservation.

This is ONE marketing site, not a portfolio or app.

## Commands

```bash
npm install
npm run dev            # Vite dev server
npm run build          # tsc -b && vite build  (run this to type-check + verify)
npm run preview        # serve the production build
npm run fetch:assets   # download the Higgsfield 2K dish photos + hero video into public/assets
npm run fetch:video    # legacy: download the older macro hero clip
```

Always run `npm run build` after changes: it type-checks with `tsc -b` (strict,
`noUnusedLocals`/`noUnusedParameters` on) and fails on unused imports.

## Stack

React 19 + TypeScript + Vite. Tailwind CSS v4 via `@tailwindcss/vite` (no
`tailwind.config`; design tokens live in an `@theme` block in `src/styles.css`).
GSAP + ScrollTrigger for chapter choreography, Lenis for smooth scroll bridged
into `gsap.ticker`, react-router-dom (BrowserRouter), lucide-react icons.

## Architecture

- `src/config/site.ts` — **single source of truth for all content**: contact
  details, video/poster sources, chapters, dishes, menu, services, FAQ. Edit
  content here, not in components.
- `src/pages/Experience.tsx` — the `/` route. Act 1 is the scroll-scrub journey
  (five `CHAPTERS` over the fixed video, wrapped in `<main ref={journeyRef}>`);
  Act 2 renders `<ContentSections />` on a solid background.
- `src/pages/PromptArchive.tsx` — the `/prompt` route: the reconstruction prompt
  with a copy button.
- `src/components/VideoStage.tsx` — the fixed scrub video. A `requestAnimationFrame`
  loop maps scroll progress **across `journeyRef` only** to `currentTime`.
  Duration is read from `loadedmetadata`, never hardcoded. Sources are tried in
  order (local file, then hosted CDN), fetched to a Blob for frame-accurate
  seeking, with a content-type guard so a dev server's `index.html` SPA fallback
  is never mistaken for a video; falls back to direct streaming.
- `src/components/ContentSections.tsx` — Act 2 sections. `DishImage` shows a
  photo from `public/assets/food/<name>.png` and falls back to a styled tile if
  the file is missing. The Reserve section plays the table video as a muted loop.
- `src/lib/journeyStore.ts` — tiny pub/sub for per-frame progress/time/duration,
  kept **outside React state** on purpose. Never drive per-frame values through
  React state or re-render on scroll.
- `src/hooks/useLenis.ts` — boots Lenis and the GSAP ticker bridge.

## Media assets

Generated with Higgsfield and served from `public/assets/`. The repo does not
commit the large media; run `npm run fetch:assets` to populate:
`public/assets/food/*.png` (dish photos + `table-hero.png`) and
`public/assets/mustang-hero.mp4` (hero scrub video). Config also lists hosted
CDN URLs as fallbacks so the site works before the local files are downloaded.
To swap a dish photo, drop a PNG with the matching name into
`public/assets/food/`. To swap the hero or reservation video, overwrite
`public/assets/mustang-hero.mp4` / `public/assets/mustang.mp4`.

## Conventions and guardrails

- One accent colour only: chili crimson `#c8353b`. Neutral base is the warm
  charcoal `ink` scale. Do not introduce a second accent.
- Fonts: Cabinet Grotesk (display), Inter Tight (body), JetBrains Mono
  (instrument labels). No serif.
- **No em dashes or en dashes in any visible copy** (headings, body, buttons).
- Every animated element needs a `prefers-reduced-motion` fallback; the video
  stage must not fetch or decode video under reduced motion.
- Use `min-h-dvh`/`dvh`, not `h-screen`.
- Keep `CHAPTERS`, dish and menu arrays as module constants; changing their
  identity intentionally rebuilds scroll controllers.
- BrowserRouter needs an SPA fallback (rewrite all paths to `index.html`) when
  deploying.
