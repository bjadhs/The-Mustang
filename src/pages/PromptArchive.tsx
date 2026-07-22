import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { SITE, VIDEO_FILENAME, VIDEO_SOURCES } from "../config/site";

const CONCEPT = `Revamp of themustangcanberra.com.au, a Nepalese restaurant and bar in Farrer, Canberra, as a single premium scroll-driven commercial landing page built around one continuous extreme macro camera journey through the steam, dough, spice and chili oil of a momo dumpling.`;

const BRAND_BRIEF = `BRAND AND ART DIRECTION BRIEF

Brand: The Mustang, Nepalese restaurant and bar, 4 Farrer Place, Farrer ACT 2607.
Tagline: A Journey Through Nepalese Taste and Spirit.
Conversion goal: table reservations, with a secondary path to the menu.

Concept spine: "one momo, magnified". The site is a tasting journey at macro
scale. Scroll is the camera dolly: the visitor physically plays an 8 second
extreme macro film that travels from steam, across hand-pleated dough, through
spice, into the crimson glow of chili oil. The interface borrows kitchen
grammar: order-docket navigation, perforated dotted rules, a skewer-like
progress gauge, a scoville heat register, mono type annotations.

Palette:
  Ink (ground)        #14181D
  Ink 2 (elevated)    #1B2129
  Steamed-dough ivory #EDE6DA (text)
  Ivory dim           #B8B1A4
  Mist                #8B929C
  Chili crimson       #C8353B (single accent, used for fills, ticks, underlines)
  Chili deep          #8E2227

Typography:
  Display: Cabinet Grotesk (700 to 800), tight tracking, leading near 0.95
  Body: Inter Tight
  Instrument copy: JetBrains Mono, uppercase, letterspaced

Narrative chapters mapped to film progress:
  01 Steam  0.00 to 0.16  arrival, hero, reserve CTA
  02 Dough  0.16 to 0.38  the craft, hand pleating, bamboo steaming
  03 Spice  0.38 to 0.62  timmur and jhol achar, animated heat register
  04 Fire   0.62 to 0.84  the bar, Himalayan spiced cocktails
  05 Table  0.84 to 1.00  commercial climax, large reserve CTA, hours, address

Signature motion behaviors:
  1. Scroll-scrubbed native video: scroll position eased into currentTime,
     duration read from loadedmetadata, never hardcoded.
  2. Chapter headlines built from overflow-hidden line masks, lines rise on a
     scrubbed timeline as each chapter enters.
  3. Docket station nav and skewer progress gauge with live film timecode,
     both clickable, scrolling the film to that station via Lenis.
  4. Scoville heat register that counts with scroll through the Spice chapter.
  5. Heat-shimmer sweep across the reserve CTA on hover, steam wisp keyframes
     behind chapter cards, film grain overlay above the video.
  All motion is gated behind prefers-reduced-motion with static fallbacks.`;

const RECONSTRUCTION_PROMPT = `You are a sole creative director and senior frontend author for a premium,
scroll-driven commercial landing page.

CONCEPT: ${CONCEPT}

VIDEO_FILENAME: ${VIDEO_FILENAME}
VIDEO PATH: /assets/${VIDEO_FILENAME} (hosted fallback: ${VIDEO_SOURCES[1]})
The video is a single continuous 8 second extreme macro camera journey:
steam, then the pleated crown of a momo dumpling, then floating spices, then
a settling crimson swirl of chili oil. Read its actual duration from
loadedmetadata rather than hardcoding eight seconds.

${BRAND_BRIEF}

STACK
- React 19, TypeScript, Vite
- Tailwind CSS v4 via @tailwindcss/vite, tokens declared in an @theme block
- GSAP with ScrollTrigger for chapter choreography
- Lenis smooth scrolling bridged into gsap.ticker (autoRaf off)
- react-router-dom with BrowserRouter
- lucide-react icons
- Native HTML video only, no canvas rendering

ARCHITECTURE
- Routes: "/" (the experience) and "/prompt" (this archive).
- The experience is about 520vh tall. The video is a fixed, full-screen,
  muted, playsinline element behind the interface with object-fit cover,
  radial vignette and top and bottom scrims for legibility.
- A requestAnimationFrame loop converts scroll progress into a target
  currentTime and eases toward it (about 0.38 lerp), skipping writes while
  video.seeking is true. Sources are tried in order, fetched to a Blob URL
  for frame-accurate seeking, falling back to direct streaming on failure.
  A poster still paints first and the video fades in over it when decodable.
- iOS decoders are primed with one muted play then pause on the first
  pointer or touch gesture.
- Each chapter is a section whose height is (to minus from) of the film
  range times 520vh, containing a sticky min-h-dvh panel. Copy panels use
  varied composition: hero bottom-left, dough card right with a chili left
  rule, spice left with a heat register, fire centered lower third, table
  centered climax with the large reserve CTA, address, hours and footer.
- A journey store (plain pub/sub outside React state) shares progress,
  film time and duration between the video stage, the docket nav, and the
  skewer gauge; per-frame values are written imperatively to the DOM.
- prefers-reduced-motion: no video fetch, poster only, all content legible.

COPY, verbatim where it matters
- Hero: "Step into the steam." then "One momo, magnified. Scroll, and the
  film moves with you: a journey through nepalese taste and spirit."
- Dough: "Folded by hand, every afternoon."
- Spice: "Timmur does the talking."
- Fire: "The bar leans in." with "Momo and a martini is a valid order here."
- Table: "The table is set." CTA label everywhere: "Reserve a table".
- Facts: ${SITE.address}. ${SITE.hours}. Phone ${SITE.phone}.
  Menu at ${SITE.menuUrl}
- Never use em dashes or en dashes anywhere in visible copy.

Build the complete production site to this specification, including the
/prompt route containing this exact reconstruction prompt with a working
copy button and a link back to the experience.`;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-line bg-canvas-2/60 p-6">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.24em] text-chili">{label}</p>
      <div className="text-sm leading-relaxed text-fg-dim">{children}</div>
    </div>
  );
}

export default function PromptArchive() {
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(RECONSTRUCTION_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable: select-and-copy remains possible from the pre block.
    }
  };

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 md:px-8">
        <Link
          to="/"
          className="group inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim transition-colors hover:text-fg"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Back to the experience
        </Link>
        <span className="font-display text-base font-extrabold tracking-tight">The Mustang</span>
      </header>
      <div className="docket-rule mx-auto max-w-5xl px-5" />

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-12 md:px-8">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl font-extrabold tracking-tighter md:text-5xl">Prompt archive</h1>
          <p className="mt-4 text-base leading-relaxed text-fg-dim">
            A self-contained reconstruction prompt for this website. Hand it, together with the film, to another
            model and it should rebuild the same experience.
          </p>
        </div>

        <Field label="Video filename">
          <code className="font-mono text-fg">{VIDEO_FILENAME}</code>
          <p className="mt-2 break-all font-mono text-xs text-fg-faint">
            Local path /assets/{VIDEO_FILENAME}, hosted render {VIDEO_SOURCES[1]}
          </p>
        </Field>

        <Field label="Concept">{CONCEPT}</Field>

        <Field label="Brand and art direction brief">
          <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-fg-dim">{BRAND_BRIEF}</pre>
        </Field>

        <Field label="Stack and architecture">
          React 19, TypeScript, Vite, Tailwind CSS v4 via @tailwindcss/vite, GSAP ScrollTrigger, Lenis smooth
          scrolling, react-router-dom with BrowserRouter, lucide-react, native HTML video scrubbed by scroll with no
          canvas rendering. Two routes: the 520vh experience at / and this archive at /prompt.
        </Field>

        <div className="border border-line bg-canvas-2/60 p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-chili">Complete reconstruction prompt</p>
            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex items-center gap-2 border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-fg transition-colors hover:border-chili active:scale-[0.98]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-chili" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy prompt"}
            </button>
          </div>
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap border-t border-line pt-4 font-mono text-xs leading-relaxed text-fg-dim">
            {RECONSTRUCTION_PROMPT}
          </pre>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-5 pb-10 md:px-8">
        <div className="docket-rule mb-5" />
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-faint">
          The Mustang, {SITE.place}. {SITE.hours}.
        </p>
      </footer>
    </div>
  );
}
