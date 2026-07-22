# PLAN.md — The Mustang, from landing page to production product

Roadmap for taking the current Vite single-page experience to a multi-page,
SEO-ready, Vercel-deployed production site for The Mustang, Farrer ACT.
Planning only. No code in this document is final; it is the build contract.

---

## 🎯 1. Goal and current state

**Current state.** One Vite + React 19 SPA. Route `/` holds everything: the
scroll-scrubbed film (five chapters: Steam, Dough, Spice, Fire, Table) plus
Act 2 content sections (story, dishes, menu teaser, services, FAQ, reserve).
`/prompt` holds the reconstruction prompt. All content lives in
`src/config/site.ts`. 7 dish photos exist in `public/assets/food/`.

**Goal.** A Next.js App Router site where every primary nav item is its own
indexable page with its own metadata and structured data, a best-in-class
menu page, a revamped reservation experience with a visual floor plan and an
AI concierge, Google Maps + Google Reviews integration, the scroll stutter
fixed, and one-command deploy to Vercel.

---

## ⚡ 2. Phase 0 — Fix the scroll stutter (do this first, it carries over)

The "stuck in the middle for a second" symptom during scroll has one primary
cause and several contributing ones. Ranked by likelihood:

### ✅ 2.1 Primary suspect: video keyframe spacing (GOP) — DONE

**Confirmed and fixed.** ffprobe proved the 8s hero had only 1 keyframe across
192 frames (worst case). Re-encoded `mustang-hero.mp4` to all-intra (192/192
keyframes) and added a lighter `mustang-hero-720.mp4`; original backed up to
`mustang-hero.orig.mp4`. Scroll-seeks are now frame-accurate.

Setting `video.currentTime` to a frame that is not a keyframe forces the
decoder to walk back to the previous keyframe and decode every frame up to
the target. Generated/hosted MP4s typically carry a keyframe only every 2 to
4 seconds (50 to 100+ frames at 24 fps). A mid-film seek can therefore decode
dozens of frames before it can paint, and the `!video.seeking` guard in
`VideoStage.tsx:113` correctly blocks further writes while that happens, so
the film visibly freezes, then jumps. That is exactly the reported symptom.

**Fix: re-encode the hero video as all-intra (every frame a keyframe).**

```bash
# Verify the problem first: count keyframe spacing
ffprobe -select_streams v -show_frames -show_entries frame=pict_type -of csv mustang-hero.mp4 | grep -n I

# Re-encode: every frame seekable instantly, audio stripped, fast start
ffmpeg -i mustang-hero.mp4 -c:v libx264 -g 1 -keyint_min 1 \
  -pix_fmt yuv420p -crf 20 -preset slow -an -movflags +faststart \
  mustang-hero-intra.mp4
```

All-intra grows the file (roughly 2 to 4x), which is acceptable for an 8
second clip. If the size is unacceptable, `-g 8` (a keyframe every 8 frames)
is the compromise. Also produce a smaller 720p variant for mobile and serve
it via a media query or `matchMedia` check.

### 🔧 2.2 Contributing causes, fix while in there

1. ✅ **DONE — `letterSpacing` tween in the Fire chapter** (`bloom` fx).
   Replaced with a transform-only per-line split (translate/opacity +
   `will-change: transform`), zero per-frame reflow.
2. ✅ **DONE — `filter: blur(9px)` tween in the Spice chapter** (`sear` fx).
   Kept the look but scoped `will-change: filter` to only while the panel is
   active in its scroll range.
3. **`gsap.ticker.lagSmoothing(0)`** in `useLenis.ts:32` disables GSAP's
   recovery after main-thread spikes, so every hiccup is fully visible.
   Intentional for scrub accuracy, but revisit after 1 and 2 are fixed.
4. **TicketNav scroll listener** calls `setState` on every scroll event.
   Cheap, but derive docking from the existing journey store subscription
   instead to keep scroll handlers to one.
5. **Fallback streaming path**: when the Blob fetch is still in flight or
   rejected, the element streams from CloudFront and every seek becomes a
   network range request. Show a subtle "loading the film" state until the
   Blob is attached so users do not scrub the streaming source.

### 🧪 2.3 Verification

Profile before and after in Chrome DevTools Performance while scrubbing
mid-film. Success = no frame over ~32 ms during steady scroll, no multi
hundred ms `seek` gaps, and the film tracking the scrollbar without pauses.

---

## ✅ 3. Phase 1 — Migrate to Next.js App Router — DONE

**Complete.** Next.js 16.2.11 App Router live in place, `next build` green.
Tokens/fonts (next/font), client/server split, react-router removed for
next/link, Vite files retired, Lenis/GSAP preserved. Route pages for /menu,
/reserve, /about, /catering being built in the feature workflow.

Folder-based routing so every nav destination is a real, individually
indexable URL. Recommended: Next.js 15+ (App Router, Metadata API, next/font,
Turbopack dev).

### 📁 3.1 Route map

| Route | Page | Indexable | Notes |
|---|---|---|---|
| `/` | Landing (film + core sections) | Yes | The cinematic act stays here |
| `/menu` | Full menu, user friendly | Yes | New, see Phase 4 |
| `/reserve` | Reservation revamp | Yes | New, see Phase 5 |
| `/about` | Story, map, reviews, FAQ | Yes | New, see Phase 7 |
| `/catering` | Catering and events | Yes | New page, from SERVICES data |
| `/prompt` | Prompt archive | noindex | Keep, exclude from sitemap |
| `/api/chat` | AI concierge route handler | n/a | Phase 6 |
| `/api/reserve` | Reservation submission | n/a | Phase 5 |

**Decision: Steam / Dough / Spice / Fire / Table do NOT become pages.**
They are film chapters, not content destinations. As standalone URLs they
would be thin doorway pages (a heading and two sentences each), which hurts
rather than helps SEO. They remain in-page stations on `/` reachable via the
docket nav and `#steam`-style anchors. The primary nav gains real pages
instead (Menu, About, Catering, Reserve). This matches your instinct that
"maybe we don't need these pages".

### 📁 3.2 Target structure

```
app/
  layout.tsx            fonts (next/font), theme, <SiteNav/>, <Footer/>, <Concierge/>
  page.tsx              landing: film journey + landing sections
  menu/page.tsx
  reserve/page.tsx
  about/page.tsx
  catering/page.tsx
  prompt/page.tsx       robots: { index: false }
  api/chat/route.ts
  api/reserve/route.ts
  sitemap.ts
  robots.ts
  opengraph-image.tsx   brand OG image (per-route overrides where useful)
  not-found.tsx         styled 404 that routes people to menu/reserve
src/
  components/           carried over; "use client" only where interactive
  config/site.ts        stays the single source of truth
  config/menu.ts        NEW: the complete menu (Phase 4)
  lib/journeyStore.ts   unchanged
```

### 🛠️ 3.3 Migration steps

1. Scaffold Next 16 + TS + Tailwind v4 (`@tailwindcss/postcss`), port the
   `@theme` token block from `src/styles.css` unchanged.
2. Move fonts to `next/font` (self-hosted Cabinet Grotesk, Inter Tight,
   JetBrains Mono) with `display: swap`. Kills FOUT and a CLS source.
3. Carry components over. Client/server split:
   - `"use client"`: VideoStage, Experience journey, TicketNav, ProgressRail,
     ReservationDialog/Form, ThemeToggle, Toast, Lenis hook, concierge.
   - Server components: all copy-bearing sections (story, dishes, menu,
     services, FAQ, footer). This is what makes the SEO phase real: every
     word of content is in the HTML response, no JS needed to read it.
4. Replace react-router (`Link`, `BrowserRouter`) with `next/link`; the SPA
   fallback guardrail in CLAUDE.md becomes obsolete (real routes now).
5. Dish photos through `next/image` (explicit width/height, `sizes`, lazy)
   except the film poster, which loads with `priority` as the LCP element.
6. Keep Lenis + GSAP exactly as-is inside the landing's client boundary.
7. `npm run build` type-checks via Next; keep strict TS flags.
8. Vite config, `index.html`, `src/main.tsx`, `App.tsx` retire at the end.

⚠️ Warning: do the migration on a branch and keep the Vite app runnable until
the Next build reaches feature parity, so there is always a deployable site.

---

## ✅ 4. Phase 2 — Navigation and header revamp — MOSTLY DONE

**Done:** global `SiteNav` (brand, center Menu/About/Catering links, phone tel
link, rightmost chili "Reserve a table" button, mobile sheet, ThemeToggle,
announcement-bar slot) and a full-NAP `Footer`, both mounted in the root
layout. **Remaining:** confirm the landing hero surfaces phone + hours in the
first viewport; final visual pass.

Primary nav (all pages, same component):

```
The Mustang  Farrer ACT     Menu   About   Catering        (02) 6286 8088   [ Reserve a table ]
└ brand, links home         └ center: page links           └ right: phone,  └ chili button,
                                                             tap to call      far right, always visible
```

- **Reserve a table** is the rightmost element on every page, chili crimson,
  the single conversion action. On mobile it stays visible next to the
  hamburger; phone collapses into the sheet menu.
- The Steam/Dough/Spice/Fire/Table docket becomes a **secondary strip shown
  only on `/` while the film is running** (the current TicketNav behavior,
  demoted below the primary links or into the progress rail).
- **Hero contact block**: the landing hero gains the phone number (tap to
  call), hours, and suburb line alongside the existing Reserve CTA and menu
  link, so the most important restaurant facts are on screen within the
  first viewport with zero scrolling.
- Footer grows to a full NAP block (name, address, phone), hours, page
  links, socials, map link. Consistent NAP on every page is a local SEO
  signal in itself.

---

## 🔍 5. Phase 3 — SEO

What actually moves the needle for a single-location restaurant, in order.

### 📄 5.1 Per-page metadata (Next Metadata API / generateMetadata)

| Page | Title (draft) | Target queries |
|---|---|---|
| `/` | Nepalese Restaurant and Bar in Canberra \| The Mustang, Farrer | nepalese restaurant canberra, momo canberra |
| `/menu` | Menu \| Nepalese Food in Canberra \| The Mustang | nepalese food canberra, momo near me, thali canberra |
| `/reserve` | Reserve a Table \| The Mustang, Farrer ACT | book a table canberra, restaurant farrer |
| `/about` | Our Story \| Nepalese Dining in Farrer \| The Mustang | restaurant farrer act, himalayan restaurant canberra |
| `/catering` | Nepalese Catering in Canberra \| The Mustang | nepalese catering canberra, event catering canberra |

Each page: unique title under ~60 chars, meta description under ~155 chars
written as an invitation (mention suburb + cuisine + a hook), canonical URL,
Open Graph + Twitter card with a real food image. One `h1` per page.

### 🗄️ 5.2 Structured data (JSON-LD, inline script per page)

- **`Restaurant`** on every page via the root layout: name, address
  (PostalAddress), geo coordinates, telephone, `servesCuisine: "Nepalese"`,
  `priceRange: "$$"`, `openingHoursSpecification` (Mo-Su 17:00-21:30),
  `acceptsReservations`, `hasMenu` pointing at `/menu`, `url`, `image`,
  sameAs (Google profile, socials). One object, stable `@id`.
- **`Menu` / `MenuSection` / `MenuItem`** on `/menu`, generated from
  `config/menu.ts` so the markup can never drift from the visible menu.
  This is a key reason the menu must be HTML, not a PDF.
- **`FAQPage`** on `/about` from the FAQS array.
- **`BreadcrumbList`** on subpages.
- **`AggregateRating` + `Review`** once the Google Reviews integration
  (Phase 7) supplies real data. Never fabricate ratings.
- Validate with Google's Rich Results Test before every deploy.

### 🌐 5.3 Technical

- `app/sitemap.ts` (all indexable routes) and `app/robots.ts` (allow all,
  point at sitemap, disallow `/api/`); `/prompt` gets `robots: noindex`.
- All content server-rendered (Phase 1 step 3 already guarantees this).
  These pages are static, so they build to CDN-served HTML by default.
- Core Web Vitals: poster image `priority` (LCP), fonts via next/font
  (CLS), film fetch deferred until after first paint and skipped entirely
  under reduced motion (already true), dish images lazy with fixed
  dimensions (CLS), no layout-animating properties (Phase 0 removed the
  letter-spacing tween).
- Descriptive `alt` on every dish photo ("Steamed chicken momo with tomato
  achar at The Mustang, Canberra").
- 301 redirects in `next.config` mapping old live-site paths if this
  replaces themustangcanberra.com.au (`/menu/` -> `/menu`,
  `/contact-us/` -> `/reserve`).

### 📍 5.4 Off-site local SEO (owner checklist, no code)

- Google Business Profile: claim, exact NAP match with the site, category
  "Nepalese restaurant", link Reserve page as the reservation link, upload
  the dish photography, answer reviews.
- Consistent NAP on Facebook/Instagram profiles and food directories
  (Zomato, TripAdvisor, etc.). Reply to reviews; steady review velocity is
  the strongest local ranking input the site itself cannot provide.

Sources:
[Next.js App Router SEO Best Practices (2026)](https://www.javascriptdoctor.blog/2026/07/nextjs-app-router-seo-best-practices.html),
[Next.js SEO: Metadata, Sitemaps & Canonicals](https://prateeksha.com/blog/nextjs-app-router-seo-metadata-sitemaps-canonicals),
[Next.js SEO Guide 2026](https://www.modernwebseo.com/en/blog/nextjs-seo-guide-2026),
[Next.js SEO Guide for 2026: App Router, Metadata API, Core Web Vitals](https://appseo.com/next-js-seo-guide-2026-app-router/),
[Restaurant Schema Markup: Complete Guide](https://union10design.co.uk/web-development/schema-markup-for-restaurants-the-complete-guide),
[Restaurant Schema Markup: Menu & Reservations](https://onthemap.agency/blog/restaurant-schema-markup/),
[Restaurant Schema Markup 2026 Guide](https://hustlemarketers.com/restaurant-schema-markup/),
[Menu Schema Markup](https://www.localclarity.com/blog-posts/how-to-get-started-with-new-restaurant-menu-schema-markup)

---

## 🍽️ 6. Phase 4 — The menu page

A separate, genuinely user-friendly `/menu`, not a PDF and not the current
teaser grid.

### 🎨 6.1 UX spec

- **Data first**: new `src/config/menu.ts` with the complete menu: every
  item with name, price, description, dietary tags (V / VG / GF / contains
  nuts), spice level (0-3 chilies), category, optional image filename.
  MENU_CATEGORIES in `site.ts` becomes a teaser derived from it.
- **Layout**: sticky horizontal category rail (Mo:Mo, Entrees, Curries and
  Mains, Rice Bread and Sides, Desserts, From the Bar) that scroll-spies;
  each category is an anchored section. Dish rows/cards show photo (with
  the existing styled-tile fallback), name, description, dietary chips,
  spice chilies, price aligned right in the docket mono style.
- **Filters that matter**: Vegetarian, Vegan, Gluten free, and a spice
  toggle. Client-side, instant, URL-reflected (`/menu?diet=veg`) so
  filtered views are shareable. Plus a simple text search.
- **Conversion**: a slim sticky bottom bar on mobile with "Reserve a table"
  and "Call". Every section ends with a quiet reserve link.
- **SEO**: server-rendered list + `Menu` JSON-LD generated from the same
  data (5.2). Category anchors give Google jump links.
- Print stylesheet so the page prints as a clean one-page menu for free.

### 🖥️ 6.2 Dish photography

`PROMPT.md` (created alongside this plan) contains ready-to-run Nano Banana
Pro prompts for every menu item that does not yet have a photo, written in
the same house style as the first 8 images (top-down premium editorial,
charcoal slate, chili accent). Generate at 2K, save to
`public/assets/food/<kebab-name>.png`, and the existing `DishImage`
convention picks them up by filename.

---

## 🪑 7. Phase 5 — Reserve a table revamp

`/reserve` becomes a two-panel experience.

### 🎨 7.1 Left panel: the room, as a floor plan

A stylized top-down SVG of the restaurant (docket/blueprint aesthetic, mono
labels, chili accents), drawn from a `floorPlan` config array so the layout
is data, not artwork:

- **Selectable**: tables with chairs (2-top rounds, 4-top squares, a 6-top
  booth row, 2 window tables). States: available (line), hovered (chili
  outline), selected (chili fill), unavailable (dimmed, dashed).
- **Context, not selectable**: entrance, bar counter with stools, kitchen
  block, toilets, plants. Labeled in JetBrains Mono like the docket UI.
- Selecting a table writes into the form ("Table 4, window, seats 2").
  Fully keyboard-accessible (each table a button with an aria-label);
  reduced motion gets no hover animation.
- ❗ Important: get a rough sketch or photo of the real room from the owner
  first; a floor plan that contradicts reality creates walk-in friction.
  Until then, mark the picker "seating preference" rather than a promise.

### 📋 7.2 Right panel: the booking form

Date (next 30 days), time slots (17:00-21:30 in 30 min steps), party size,
name, phone, email, occasion/notes, selected table pre-filled. Submits to
`app/api/reserve/route.ts`.

**v1 (ship first)**: the route validates, then emails the restaurant
(Resend free tier) and shows a confirmation state; the table choice is a
preference, no availability engine. **v2 (optional)**: persist bookings in
Neon Postgres (MCP already connected) and compute real per-slot table
availability, at which point the floor plan can show live unavailable
states. Plan for v1, design the API shape so v2 slots in.

### 🤖 7.3 Bottom-right: the AI concierge (uses the ai-sdk skill)

A floating chili button, bottom-right on every page, opening a compact chat
panel in the docket visual language.

- **Stack**: Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/react`),
  `useChat` on the client, `streamText` in `app/api/chat/route.ts`,
  model `claude-haiku-4-5` (fast/cheap) with `claude-sonnet-5` as the
  quality fallback option. Build against the **ai-sdk skill** for exact
  current APIs.
- **Knowledge**: system prompt assembled at build time from `site.ts` +
  `menu.ts` (hours, address, phone, full menu with prices, dietary info,
  FAQ, services, catering). The whole corpus is small; no RAG needed.
- **Tools** (AI SDK tool calling):
  - `startReservation({date, time, partySize})`: deep-links to `/reserve`
    with the form pre-filled; the AI never confirms a booking itself.
  - `getMenu({category?, diet?})`: returns structured menu data so answers
    quote real prices.
- **Guardrails**: answers only restaurant topics, states it cannot take
  payment or guarantee a table, hands off to the phone number for same-day
  bookings. Rate-limit the route (per-IP) since it spends API tokens.
- `ANTHROPIC_API_KEY` server-side only, via Vercel env vars.

---

## 📍 8. Phase 6 — Google Maps and Google Reviews

### 🌐 8.1 Map on `/about`

Recommended: **Maps Embed API iframe** (free, no billing surprises, zero
JS weight) with dark styling, wrapped in a click-to-load facade so the
iframe never blocks page load, plus a "Get directions" link to the existing
`SITE.mapUrl`. A `@vis.gl/react-google-maps` interactive map is the upgrade
path only if custom-styled pins become a design requirement.

### ⭐ 8.2 Reviews in two places

- **Source**: Google Places API, Place Details `reviews` field (returns up
  to 5 reviews + `rating` + `userRatingCount`). Requires an API key with
  billing enabled; costs are trivial at this traffic.
- **Server-side fetch with ISR** (`revalidate: 86400`): reviews are fetched
  once a day at the server, never from the browser, so the key stays
  secret and the page stays fast.
- **Fallback**: a curated `REVIEWS` array in `site.ts` (real quotes the
  owner already has) renders if the API key is absent or the call fails,
  so the section never breaks.
- **Placement 1, landing**: a slim band between the dishes and reserve
  sections: aggregate stars + count ("4.x from NNN Google reviews") and 2-3
  short quotes in the docket card style.
- **Placement 2, `/about`**: the full section: aggregate header, 5 review
  cards (author, stars, relative date), "Review us on Google" + "See all
  reviews" links.
- Once live data flows, feed the same numbers into `AggregateRating`
  JSON-LD (5.2) so stars can appear in search results.

---

## 🚢 9. Phase 7 — Production hardening and Vercel deploy

- **Vercel project**: connect repo, framework preset Next.js. Env vars
  (per owner decisions): `ANTHROPIC_API_KEY` (concierge), and SMTP for
  reservation email via nodemailer: `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE`
  / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` / `RESERVATION_TO`. No Google Maps
  key (About uses an owner-provided map image). No `DATABASE_URL` in v1.
- **Media**: dish PNGs (already in `public/`) commit fine; the hero MP4s
  should either be committed (Vercel serves them from the CDN edge) or kept
  on the existing CloudFront URLs; drop the `fetch:assets` step from the
  production path either way. Convert dish PNGs to WebP/AVIF via
  `next/image` automatically.
- **Analytics**: Vercel Analytics + Speed Insights (one-line each). GA4
  only if the owner wants marketing funnels.
- **Quality gates before go-live**: `next build` clean; Lighthouse mobile
  90+ on `/`, `/menu`, `/reserve`; Rich Results Test passes for Restaurant,
  Menu, FAQPage; keyboard-only pass of nav, menu filters, floor plan, chat;
  reduced-motion pass; 375 px and 1440 px visual pass; 404 page; favicon +
  app icons + `theme-color`.
- **Domain**: none for now (owner decision) — deploy to the default
  `*.vercel.app` URL. Revisit custom domain + Search Console sitemap later.

---

## 💡 10. Recommendations (the "what else" you asked for)

1. **Catering page doubles as functions/events page.** Banquet menu from
   $20 pp (already in SERVICES), private events copy, a short enquiry form
   posting to the same email route. One strong page beats two thin ones.
2. **Announcement bar** slot above the nav, driven from `site.ts` (e.g.
   "Closed for Dashain Oct 2" or "Live music Fridays"). Restaurants need
   this constantly; make it a config edit, not a code change.
3. **Order-online CTA** in nav overflow and footer pointing at the existing
   ordering system (`SITE.orderUrl`), labeled "Takeaway".
4. **Instagram band** on the landing: a static row of 4-6 food shots
   linking to the profile. No API integration; just curated images.
5. **`/prompt` stays but noindexed**: it is a portfolio artifact, not
   restaurant content.
6. **Skip for now** (deliberately out of scope): online payments/deposits,
   gift vouchers, multi-language, a CMS. `site.ts`/`menu.ts` is the CMS
   until the owner asks for self-service editing.

---

## ☑️ 11. Build order

| # | Phase | Depends on | Size | Status |
|---|---|---|---|---|
| 0 | Scroll stutter fix (re-encode + tween fixes) | none | S | ✅ Done |
| 1 | Next.js App Router migration, feature parity on `/` | 0 | L | ✅ Done |
| 2 | Nav revamp + hero contact block + footer NAP | 1 | S | ✅ Nav + footer done, hero pass pending |
| 3 | SEO layer: metadata, JSON-LD, sitemap, robots | 1 | M | ✅ Done (Restaurant/Menu/FAQPage JSON-LD, sitemap, robots, 404) |
| 4 | `/menu` page + `menu.ts` | 1 | M | ✅ Page + Menu JSON-LD done; dish images still to generate (PROMPT.md) |
| 5 | `/about` + `/catering` pages | 1 | M | ✅ Done (map-image slot awaits owner image) |
| 6 | `/reserve` revamp: floor plan + form + email route | 1 | L | ✅ Done (SMTP route needs `.env` password) |
| 7 | AI concierge (ai-sdk) | 1 | M | ✅ Done (needs `ANTHROPIC_API_KEY` at runtime) |
| 8 | Reviews (landing band + about section) | 5 | M | ✅ Reviews done; map = owner image at `public/assets/map.png` |
| 9 | Production hardening, Vercel deploy (no domain) | all | M | ⬜ Pending (build green + smoke test passed) |

Each phase ends with `npm run build` green and a visual check.

✅ **Done:** Phases 0-8. `next build` green (11 routes); `next start` smoke
test passed (all routes 200, JSON-LD present, /_not-found 404, sitemap
excludes /prompt, robots blocks /api).
⬜ **Pending (owner inputs + deploy):** map image at `public/assets/map.png`,
`.env` (SMTP password + `ANTHROPIC_API_KEY`), generate remaining dish photos
from PROMPT.md, point sitemap/canonical host at an env var, then Vercel deploy.

📝 Note: open questions for the owner, none of which block Phases 0-4:
real floor plan sketch (7.1), Google Maps API key + billing (8), a Resend
or preferred email path for reservations (7.2), and whether this site takes
over the production domain (5.3 redirects).
