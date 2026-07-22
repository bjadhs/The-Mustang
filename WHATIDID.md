# WHATIDID.md

Session log: scope, changes, verification, follow-ups. Newest entries at the top.

---

## 2026-07-23 — Planning: Next.js migration roadmap, SEO strategy, and scroll-stutter diagnosis

**Scope:** Planning-only session to architect a major framework migration (Vite SPA → Next.js App Router), define SEO hardening, identify scroll-stutter root causes, and create dish photo prompts for Higgsfield generation.

**Changes:**
- `PLAN.md` — Created comprehensive production roadmap with 5 migration phases (routes /, /menu, /reserve, /about, /catering; chapter anchors steam/dough/spice/fire/table stay in-page, not separate pages), SEO plan (Metadata API, Restaurant/Menu/FAQPage JSON-LD, sitemap.ts/robots.ts, local SEO + Places API), menu page spec (grid, filters, modals), reserve revamp (SVG floor plan, booking form, AI concierge via Vercel AI SDK), Google Maps embed with ISR, Vercel deploy hardening, and build-order table.
- `PROMPT.md` — Created 26 Higgsfield Nano Banana Pro prompts: shared house-style block + 24 per-dish subjects (filenames matching `public/assets/food/` DishImage convention) plus 2 optional 16:9 scene shots.
- Scroll-stutter diagnosis (code audit, no profiling run): Primary suspect is video GOP/keyframe spacing causing slow `currentTime` seeks mid-film (VideoStage.tsx:113 write guard freezes film during seek); contributing: `letterSpacing` tween (reflow per frame, Experience.tsx:247), `blur(9px)` filter tween, `lagSmoothing(0)` in useLenis.ts:32. Planned fix: ffmpeg all-intra re-encode (`-g 1`) + transform-based tweens.

**Verified:**
- Code reading of VideoStage.tsx, Experience.tsx, useLenis.ts for stutter architecture and contributor effects.
- PLAN.md structure validated against site architecture and Next.js conventions.
- PROMPT.md format cross-checked against existing `public/assets/food/` DishImage naming.
- **NOT verified:** actual profiling run (CPU/GPU flame chart), fix effectiveness post-implementation, Next.js migration feasibility (no prototype built), Higgsfield prompt quality (awaiting execution).

**Follow-ups:**
- Implement ffmpeg all-intra video re-encode to eliminate GOP stalls.
- Refactor letterSpacing/blur tweens to transform-based equivalents (will-change: transform, GPU-accelerated).
- Execute Next.js migration phases 1–5 per PLAN.md; monitor build size + hydration metrics.
- Run Higgsfield dish photo generation via PROMPT.md prompts; validate asset pipeline.
- Liaise with client on route structure (especially thin landing pages concern); decide on chapter treatment post-migration.

## 2026-07-22 — Full dual-theme revamp and cinema-editorial redesign

**Scope:** Complete dual-theme overhaul (dark "midnight service" + light "lokta paper daylight") with cinema Act 1 upgrades (film HUD, GSAP entrance grammar, glass chapter cards) and Act 2 editorial redesign (marquee, story asymmetry, menu board, signage footer).

**Changes:**
- `src/styles.css` — Added `@theme inline` Tailwind v4 semantic tokens (canvas/fg/line/chili/cream) with `--m-*` indirection variables for runtime theme switching.
- `index.html` — Prepended pre-paint theme script to apply data-theme and custom properties before page render.
- `src/hooks/useTheme.ts` — New hook managing dark/light theme state with localStorage persistence.
- `src/components/ThemeToggle.tsx` — New ember/paper diamond-knob toggle with view-transition cross-fade between themes.
- `src/components/Experience.tsx` — Integrated letterbox bars driven from journeyStore; cinema HUD with timecode, chapter, and frame counters.
- `src/components/ProgressRail.tsx` — Updated to emit chapter markers and timecode display tied to journey playhead.
- `src/components/TicketNav.tsx` — Navigation docks onto glass panel past journey; themed per current data-theme.
- `src/components/VideoStage.tsx` — Film playback stage with glass container; .on-film cream+shadow treatment for all overlay text.
- `src/components/ContentSections.tsx` — Act 2 redesign: marquee seam band, asymmetric story grid, staggered dish layout, sticky menu board, ledger services table, signage-scale footer. Migrated token references to @theme indirection.
- `src/components/PromptArchive.tsx` — Migrated CSS variable references to runtime `--m-*` theme indirection.

**Verified:**
- Chrome extension subagent audited both dark and light themes for contrast, legibility, and layout integrity.
- Found and fixed: chili eyebrow labels illegible on warm footage (changed to cream + diamond accent), weak scrims over bright plate (bumped to 0.68 radial), marquee missing mask wrapper (added), startViewTransition errors in hidden tabs (guarded with frame visibility check), missing local hero asset (fetched via npm run fetch:assets).
- `npm run build` passes; all CSS and TypeScript compile clean.
- **NOT verified:** mobile responsive polish; visible live-browser session (tab was hidden during automated testing).

**Follow-ups:**
- Mobile responsiveness pass (breakpoints, touch targets, layout reflow).
- Manual browser session testing with visible tab to verify scrub feel and transition performance.
