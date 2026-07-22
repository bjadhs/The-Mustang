# WrongWayRight.md

Real mistakes caught and corrected. Newest entries at the top.

---

## 6. AI SDK v7 convertToModelMessages is async

**Wrong way:** The `/api/chat` route handler was written as `messages: convertToModelMessages(messages)` in the POST body for `generateText()`, treating `convertToModelMessages` as synchronous (as it was in older AI SDK versions and as the type snippet in `node_modules/ai/dist/index.d.ts` appeared to suggest). The Next.js build failed with a type error because in ai@7.0.35, `convertToModelMessages` returns `Promise<ModelMessage[]>`, not `ModelMessage[]`.

**Right way:** `messages: await convertToModelMessages(messages)` inside the async POST handler. Build compiled green and `/api/chat` routed correctly.

**Why:** The AI SDK changed `convertToModelMessages` to async between major versions; memory and older examples show it sync, so the signature is easy to misremember. Cheap check: read the bundled docs in `node_modules/ai/docs/02-getting-started/02-nextjs-app-router.mdx` (shows `await convertToModelMessages(...)`) and always run `npx next build` or `tsc --noEmit` immediately after wiring a new SDK version, rather than trusting a remembered signature. For the Vercel AI SDK specifically, verify against the installed package's bundled source/docs, not training memory or older tutorials.

## 5. useSearchParams without a Suspense boundary opts the whole route out of static prerender

**Wrong way:** The `/menu` filter state needed to be URL-reflected, so the plan was to call `useRouter`/`useSearchParams` straight inside the `MenuView` client component and read/write the query there. In App Router (Next 16), a client component that calls `useSearchParams` and is not wrapped in `<Suspense>` forces its entire route to render dynamically (`ƒ`) rather than prerender to static HTML (`○`), and in stricter setups the build errors with "useSearchParams() should be wrapped in a suspense boundary". A menu page that we want Google to crawl as static HTML silently losing its static prerender is exactly the wrong outcome.

**Right way:** Split the component: `export default function MenuView()` returns `<Suspense fallback={null}><MenuViewInner/></Suspense>`, and only `MenuViewInner` calls `useSearchParams`. Keep filter state in React `useState` (initialised once from `searchParams`) as the render source of truth so filtering is instant, and mirror it back with `router.replace(next, { scroll: false })` in an effect keyed on the derived query string. Build confirms it: `/menu` shows `○ (Static)` and the Menu JSON-LD is baked into `.next/server/app/menu.html` (6 MenuSection, 38 MenuItem, 38 AUD offers).

**Why:** `useSearchParams` reads a value only known at request time, so Next must either defer that subtree behind Suspense (letting the rest prerender) or make the whole route dynamic. The Suspense boundary is what lets the static shell prerender while the param-dependent subtree hydrates on the client. Cheap check: after `next build`, look at the route legend, `○` means you kept static, `ƒ` means a hook (usually `useSearchParams`, `cookies()`, `headers()`) pulled the route dynamic, go find it.

## 4. rAF-gated entrance animations screenshot as invisible in a non-foreground automation tab

**Wrong way:** The reservation dialog and toast play their entrance by mounting at `opacity-0` and flipping to `opacity-100` on the next `requestAnimationFrame` (`useEffect(() => { requestAnimationFrame(() => setShown(true)) })`). Driving the page through browser automation, the dialog screenshotted as bare form controls floating on the food photo with *no* panel fill and *no* backdrop dim, even a full second after opening. First read was "the `bg-canvas-2` panel and `bg-black/70` backdrop aren't rendering" — i.e. a CSS bug.

**Right way:** `getComputedStyle` told the real story: backdrop `background: oklab(0 0 0 / 0.7)`, `backdrop-filter: blur(8px)`, panel `background: rgb(27,33,41)` — all correct — but `opacity` was stuck at `0.08`/`0.44`, mid-transition. The automated tab isn't the foreground tab, so `requestAnimationFrame` and CSS transitions are throttled/paused and the entrance never completes on the compositor. To capture the intended look, force the resting state before the screenshot: `el.style.transition='none'; el.style.opacity='1'; el.style.transform='none'`. Behavior itself was verified structurally (`requestSubmit()` -> `dialogStillOpen:false`, `toastPresent:true`, correct toast text), not from the camera.

**Why:** Background/occluded tabs clamp `requestAnimationFrame` to near-zero and freeze compositor-driven transitions, so any "reveal on next frame" pattern stays at its initial style in automation even though the markup and computed values are right. Same family as entry 3 (trust the DOM over the screenshot), different mechanism: there it was Lenis desync, here it is rAF/transition throttling. Cheap check: if elements are present with correct computed `background`/`border` but a fractional `opacity`, it is a stalled entrance, not a style bug — force the end state or assert on computed values instead of pixels.

## 3. Screenshotting Act 2 by programmatic scroll fights Lenis and returns blank frames

**Wrong way:** To verify the new reservation form in the Reserve section (far down Act 2), I drove the page with `End`, keyboard `PageUp`, and the extension's `scroll_to` (which calls native `scrollIntoView`). Every screenshot came back as a uniform charcoal `#14181d` (bare `canvas`), even though `getBoundingClientRect()` reported the form at `top: 32, opacity: 1, visible` and dead-center in the viewport. I burned ~15 tool calls chasing "why is the form not rendering" when nothing was wrong with the form.

**Right way:** Two things. (1) For *functional* proof, drive the React form directly in one `javascript_tool` call: set each control with the native value setter + dispatched `input`/`change` events, `form.requestSubmit()`, then poll `button.innerText` and `document.querySelector('[role=status]')` — that captured the full flow (`"Sending your request"` -> reset, `toastPresent: true`, fields cleared) deterministically. (2) For *visual* proof, only the extension's wheel `scroll` action moves Lenis in sync with what gets painted; native scroll APIs do not. Even then, land slowly — the hero, chapters and dish grid all screenshotted fine mid-wheel-scroll.

**Why:** Lenis smooth-scroll keeps its own animated scroll target and translates the content; native `scrollIntoView`/`End`/`scrollTo` jump the *native* scroll offset while Lenis holds the paint elsewhere, so the compositor shows a gap (the fixed `VideoStage`/canvas) and `getBoundingClientRect` — which reflects native layout — disagrees with the pixels. A second trap in the same page: `[data-reveal]` sections start at `opacity-0` and only flip via IntersectionObserver, which doesn't fire for elements fast-scrolled past, so those sections are *legitimately* invisible in automation (force them with `el.dataset.shown='true'`). The cheap check: if a screenshot is blank but `getBoundingClientRect` says the element is on-screen and opaque, stop debugging the element — it is a smooth-scroll/compositor desync, so verify behavior via the DOM instead of the camera. (`window.lenis` is only the library's `{version}` marker, not the instance — the instance lives in the `useLenis` ref and is not reachable from the page.)

## 2. Chili accent text over warm footage passes in the head, fails on the plate

**Wrong way:** Station eyebrow labels ("04 FIRE", "05 TABLE") were set in brand chili #c8353b with a text-shadow directly over the film, assuming the shadow guaranteed legibility. A real-browser screenshot audit showed chili on the warm brown/rice frames has almost no luminance gap and was genuinely hard to read even with `text-shadow 0 1px 10px rgba(0,0,0,0.65)`.

**Right way:** Cream #f6efe2 carries the words (using the .on-film layered-shadow treatment) and chili is demoted to a glowing 7px diamond tick next to the label; scrims behind copy that crosses the bright plate were bumped from 0.52/0.55 to a `strong` 0.68 radial variant.

**Why:** Text-shadow fixes contrast against darkness, not against similar-luminance hues. A saturated accent over footage of food in the same warm register fails no matter the shadow depth. The cheap check is screenshotting text over the actual worst-case frame (the brightest/warmest one), not judging from token values alone.

## 1. var(--color-*) does not exist at runtime under Tailwind v4 @theme inline

**Wrong way:** styles.css and ContentSections.tsx referenced theme tokens as plain CSS variables, e.g. `background: var(--color-canvas)` on html, `color: var(--color-cream)` in .on-film, and `[-webkit-text-stroke:1.5px_var(--color-fg-faint)]` for outlined marquee glyphs. The build (tsc + vite) passed clean and nothing errored in the console; the page would simply have rendered with an unstyled background and invisible cream text because those variables resolve to nothing.

**Right way:** With `@theme inline`, Tailwind inlines the referenced value into each utility and never emits `--color-*` custom properties to :root, so hand-written CSS must reference the runtime indirection variables directly (`var(--m-canvas)`, `var(--m-fg-faint)`) or use a literal value (#f6efe2 for the constant cream).

**Why:** `@theme inline` exists precisely to skip emitting the --color-* layer; utilities keep working, so the breakage hides in the few hand-written declarations, and a passing build gives false confidence since undefined var() fails silently to `initial`/inherited. Cheap check: `grep -n "var(--color-" src/` after any Tailwind v4 theming work; anything outside the @theme block is suspect.
