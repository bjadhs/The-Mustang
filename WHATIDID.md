# WHATIDID.md

Session log: scope, changes, verification, follow-ups. Newest entries at the top.

---

## 2026-07-23 — Vite to Next.js 16 migration, scroll-stutter fix, and production features

**Scope:** Complete migration from Vite SPA to Next.js 16.2.11 App Router with multi-page routing, scroll-stutter resolution, production-ready features (menu, reservations, AI concierge, SEO), and git initialization.

**Changes:**
- `public/assets/mustang-hero.mp4` — Re-encoded to all-intra (192/192 keyframes) using ffmpeg with `-g 1 -keyint_min 1`; original backed up to `mustang-hero.orig.mp4`. Added 720p variant. Eliminates frame-accurate seek stalls caused by sparse keyframe spacing.
- Migrated entire app from Vite to Next.js 16.2.11 App Router with per-route static/dynamic rendering.
- `app/layout.tsx` — Global layout with SiteNav, Footer, ThemeToggle, Metadata API, Restaurant JSON-LD, and Lenis smooth-scroll setup.
- `app/globals.css` — Ported Tailwind v4 `@theme` tokens to inline semantic variables (canvas/fg/line/chili/cream).
- `app/fonts.ts` — Migrated to next/font (Bricolage Grotesque, Inter Tight, JetBrains Mono).
- `app/page.tsx` — Home/landing: Act 1 scroll-scrub film (five CHAPTERS) + Act 2 content sections; scroll-stutter fixed by video re-encode.
- `app/menu/page.tsx` — Filterable menu (HTML + MenuSection/MenuItem/AggregateOffer JSON-LD); Suspense-wrapped to maintain static prerender (`○`).
- `app/reserve/page.tsx` — Booking with SVG floor plan (from `config/floorPlan.ts`), form, and `/api/reserve` integration.
- `app/about/page.tsx` — Story, map image slot, reviews carousel, FAQ; renders FAQPage JSON-LD.
- `app/catering/page.tsx` — Enquiry form posting to `/api/reserve` with `kind=catering-enquiry`.
- `app/api/chat/route.ts` — AI concierge (Vercel AI SDK v7, Claude Haiku 4.5); tools: `getMenu`, `startReservation`; supports `/reserve` deep-link prefill via query params.
- `app/api/reserve/route.ts` — Nodemailer SMTP POST handler for booking + enquiry emails.
- `app/sitemap.ts`, `app/robots.ts`, `app/not-found.tsx` — SEO hardening (static sitemap, /api disallow, custom 404).
- `src/config/site.ts` — Added REVIEWS (placeholder) and GEO (location).
- `src/config/menu.ts`, `src/config/floorPlan.ts` — Structured menu and SVG floor plan for renders.
- Scroll perf fixes: (a) replaced per-frame letterSpacing tween with transform-based "bloom" scaling (no reflow), (b) scoped will-change:filter to blur targets.

**Verified:**
- `next build` passes green (11 routes); `.next/server/` artifacts confirm static prerender on /, /menu, /about and SSR on /api/*.
- Production smoke test via `next start`: 200 on /, /menu, /reserve, /about, /catering, /api/chat, /api/reserve, /prompt; /_not-found → 404.
- Server-rendered JSON-LD (Restaurant, MenuSection/MenuItem, FAQPage) baked into `.next/server/` HTML.
- Git initialized: identity bijaya <bijayadhikari107@gmail.com>, checkpoints faf1b0d (checkpoint), 8e5ee67 (foundation), 627b48c (features), 76b7f12 (prefill).
- **NOT verified:** Map image (public/assets/map.png — client to provide), SMTP_PASS + ANTHROPIC_API_KEY in .env, 23 of ~30 dish photos (7 exist; rest fallback to tiles; 24 subjects in PROMPT.md await Higgsfield), Vercel deploy (no domain assigned).

**Follow-ups:**
- Client to provide: map.png, SMTP credentials, ANTHROPIC_API_KEY.
- Execute Higgsfield dish photo generation via PROMPT.md (24 subjects).
- Vercel deploy: configure domain, push .env, enable preview/production.
- Production perf: measure LCP/CLS, consider image blur strategy for dish photos.

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
