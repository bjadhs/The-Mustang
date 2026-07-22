import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Flame } from "lucide-react";
import { CHAPTERS, EXPERIENCE_VH, SITE } from "../config/site";
import { journey } from "../lib/journeyStore";
import { useLenis } from "../hooks/useLenis";
import VideoStage from "../components/VideoStage";
import { useReservationDialog } from "../components/ReservationDialog";
import TicketNav from "../components/TicketNav";
import ProgressRail from "../components/ProgressRail";
import ContentSections from "../components/ContentSections";

gsap.registerPlugin(ScrollTrigger);

/** Splits a heading into rising lines for the chapter builds. */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block overflow-hidden">
          <span className="chapter-line block">{line}</span>
        </span>
      ))}
    </>
  );
}

function ReserveCta({ large = false }: { large?: boolean }) {
  const { open } = useReservationDialog();
  return (
    <button
      type="button"
      onClick={open}
      className={`cta-shimmer relative inline-flex items-center gap-3 overflow-hidden bg-chili font-display font-bold tracking-tight text-cream transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] ${
        large ? "px-10 py-5 text-xl" : "px-7 py-4 text-base"
      }`}
    >
      Reserve a table
      <ArrowUpRight className={large ? "h-5 w-5" : "h-4 w-4"} />
    </button>
  );
}

function MenuLink() {
  return (
    <a
      href={SITE.menuUrl}
      target="_blank"
      rel="noreferrer"
      className="group inline-flex items-center gap-2 border-b border-cream/30 pb-1 font-mono text-xs uppercase tracking-[0.18em] text-cream/70 transition-colors hover:border-chili hover:text-cream"
    >
      Explore the menu
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

/** Localized legibility scrim behind copy that floats naked over the film.
    Layered, not full-frame: the footage stays visible around the text. */
function FilmScrim({ strong = false }: { strong?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute -inset-x-10 -inset-y-12 -z-10 ${
        strong
          ? "bg-[radial-gradient(ellipse_at_center,rgba(8,10,13,0.68),transparent_78%)]"
          : "bg-[radial-gradient(ellipse_at_center,rgba(8,10,13,0.55),transparent_72%)]"
      }`}
    />
  );
}

/** Station eyebrow over raw footage: cream ink anchored by a chili ember tick.
    Chili alone dies on warm mid-tone frames, so the colour carries the mark
    and the cream carries the words. */
function Station({ label, center = false }: { label: string; center?: boolean }) {
  return (
    <p
      className={`on-film mb-4 flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.24em] ${
        center ? "justify-center" : ""
      }`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-[7px] w-[7px] rotate-45 bg-chili shadow-[0_0_10px_rgba(200,53,59,0.85)]"
      />
      {label}
    </p>
  );
}

/** Steam wisps rendered behind chapter copy. Decorative only. */
function Steam() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -top-10 left-6 flex gap-6">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="steam-wisp block h-16 w-px rounded-full bg-gradient-to-t from-transparent via-cream/40 to-transparent"
          style={{ animationDelay: `${i * 1.4}s` }}
        />
      ))}
    </div>
  );
}

export default function Experience() {
  const lenisRef = useLenis();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const journeyRef = useRef<HTMLElement | null>(null);
  const heatRef = useRef<HTMLSpanElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);
  const barTopRef = useRef<HTMLDivElement | null>(null);
  const barBottomRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);

  const stationTargets = useMemo(
    () => CHAPTERS.map((c) => (c.from + (c.to - c.from) * 0.35)),
    [],
  );

  const goToStation = (i: number) => {
    const el = journeyRef.current;
    let y: number;
    if (el) {
      const absTop = el.getBoundingClientRect().top + window.scrollY;
      const span = Math.max(0, el.offsetHeight - window.innerHeight);
      y = absTop + stationTargets[i] * span;
    } else {
      y = stationTargets[i] * (document.documentElement.scrollHeight - window.innerHeight);
    }
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(y, { duration: 1.6 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  /* Track the active chapter for the docket nav. */
  useEffect(() => {
    let last = 0;
    return journey.subscribe(({ progress }) => {
      const idx = CHAPTERS.findIndex((c) => progress >= c.from && progress < c.to);
      const next = idx === -1 ? CHAPTERS.length - 1 : idx;
      if (next !== last) {
        last = next;
        setActive(next);
      }
    });
  }, []);

  /* Spice heat readout counts with scroll through the third chapter. */
  useEffect(() => {
    const spice = CHAPTERS[2];
    return journey.subscribe(({ progress }) => {
      if (!heatRef.current) return;
      const local = Math.min(1, Math.max(0, (progress - spice.from) / (spice.to - spice.from)));
      heatRef.current.textContent = String(Math.round(local * 12000).toLocaleString());
    });
  }, []);

  /* Letterbox bars frame the film while the journey runs, then release.
     The scroll cue fades the instant the visitor starts the film. */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return journey.subscribe(({ progress }) => {
      if (!reduced) {
        const rampIn = Math.min(progress / 0.07, 1);
        const rampOut = Math.min(Math.max((1 - progress) / 0.09, 0), 1);
        const s = rampIn * rampOut;
        if (barTopRef.current) barTopRef.current.style.transform = `scaleY(${s})`;
        if (barBottomRef.current) barBottomRef.current.style.transform = `scaleY(${s})`;
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = Math.max(0, 1 - progress * 16).toFixed(3);
      }
    });
  }, []);

  /* Chapter choreography: each chapter gets its own entrance grammar. */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      if (reduced) return;

      // Hero builds on mount, never gated on the viewport.
      gsap.from(".hero-build .chapter-line", {
        yPercent: 115,
        skewY: 4,
        transformOrigin: "0% 100%",
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
        delay: 0.25,
      });
      gsap.from(".hero-sub", { y: 24, opacity: 0, duration: 0.9, delay: 0.75, ease: "power3.out" });
      gsap.fromTo(
        ".cue-line",
        { yPercent: -100 },
        { yPercent: 100, duration: 1.5, repeat: -1, ease: "power2.inOut" },
      );

      // Each panel yields the stage as its chapter ends, so handoffs stay clean.
      const sections = gsap.utils.toArray<HTMLElement>("main > section");
      sections.forEach((section, i) => {
        if (i === sections.length - 1) return;
        const content = section.querySelector<HTMLElement>("[data-chapter-content]");
        if (!content) return;
        gsap.to(content, {
          opacity: 0,
          y: -70,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "bottom 78%",
            end: "bottom 38%",
            scrub: 0.4,
          },
        });
      });

      // Per-chapter grammar: wipe for the fold, sear for the spice,
      // tracking bloom for the bar, a grand settle for the table.
      document.querySelectorAll<HTMLElement>("[data-chapter-panel]").forEach((panel) => {
        const fx = panel.dataset.fx;
        const lines = panel.querySelectorAll(".chapter-line");
        const heading = panel.querySelector<HTMLElement>("[data-chapter-heading]");
        const card = panel.querySelector<HTMLElement>("[data-chapter-card]");
        const extras = panel.querySelectorAll("[data-chapter-extra]");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: panel.parentElement,
            start: "top 80%",
            end: "top 25%",
            scrub: 0.6,
          },
        });
        if (fx === "wipe" && card) {
          tl.fromTo(
            card,
            { clipPath: "inset(0 100% 0 0)" },
            { clipPath: "inset(0 0% 0 0)", ease: "none" },
            0,
          );
        }
        if (fx === "bloom") {
          tl.fromTo(
            lines,
            { letterSpacing: "0.22em", opacity: 0 },
            { letterSpacing: "0em", opacity: 1, stagger: 0.05, ease: "none" },
            0,
          );
        } else {
          tl.fromTo(lines, { yPercent: 110 }, { yPercent: 0, stagger: 0.08, ease: "none" }, 0);
        }
        if (fx === "sear" && heading) {
          tl.fromTo(heading, { filter: "blur(9px)" }, { filter: "blur(0px)", ease: "none" }, 0);
        }
        if (fx === "grand" && heading) {
          tl.fromTo(
            heading,
            { scale: 1.06, transformOrigin: "50% 100%" },
            { scale: 1, ease: "none" },
            0,
          );
        }
        tl.fromTo(
          extras,
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, ease: "none" },
          0.15,
        );
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const heights = CHAPTERS.map((c) => (c.to - c.from) * EXPERIENCE_VH);

  return (
    <div ref={rootRef} className="grain relative text-fg">
      <VideoStage rangeRef={journeyRef} />
      <TicketNav onStation={goToStation} activeIndex={active} />
      <ProgressRail onStation={goToStation} />

      {/* Letterbox cinema bars, driven per frame from the journey store. */}
      <div
        ref={barTopRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[3vh] origin-top bg-[#050607]"
        style={{ transform: "scaleY(0)" }}
      />
      <div
        ref={barBottomRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-[3vh] origin-bottom bg-[#050607]"
        style={{ transform: "scaleY(0)" }}
      />

      <main ref={journeyRef} className="relative z-10">
        {/* 01 STEAM: the arrival */}
        <section style={{ height: `${heights[0]}vh` }} className="relative">
          <div className="sticky top-0 flex min-h-dvh items-end">
            <div data-chapter-content className="mx-auto w-full max-w-7xl px-5 pb-24 md:px-8 lg:pl-24">
              <div className="relative max-w-3xl">
                <FilmScrim />
                <Station label={CHAPTERS[0].station} />
                <p className="on-film-dim mb-5 font-mono text-[11px] uppercase tracking-[0.24em]">
                  Nepalese restaurant and bar, Farrer ACT
                </p>
                <h1 className="hero-build on-film font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
                  <Lines text={"The Himalayas,\non your plate."} />
                </h1>
                <p className="hero-sub on-film-dim mt-6 max-w-[46ch] text-base leading-relaxed md:text-lg">
                  One momo, magnified. Scroll, and the film moves with you: {SITE.tagline.toLowerCase()}.
                </p>
                <div className="hero-sub mt-8 flex flex-wrap items-center gap-6">
                  <ReserveCta />
                  <MenuLink />
                </div>
              </div>
            </div>
            <div
              ref={cueRef}
              aria-hidden="true"
              className="on-film-dim pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
            >
              <span
                aria-hidden="true"
                className="absolute -inset-x-12 -inset-y-6 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(8,10,13,0.5),transparent_75%)]"
              />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
                Scroll to roll the film
              </span>
              <span className="block h-8 w-px overflow-hidden bg-cream/15">
                <span className="cue-line block h-full w-full bg-chili" />
              </span>
            </div>
          </div>
        </section>

        {/* 02 DOUGH: the craft */}
        <section style={{ height: `${heights[1]}vh` }} className="relative">
          <div data-chapter-panel data-fx="wipe" className="sticky top-0 flex min-h-dvh items-center justify-end">
            <div data-chapter-content className="mx-auto w-full max-w-7xl px-5 md:px-8">
              <div data-chapter-card className="glass relative ml-auto max-w-md border-l-2 border-l-chili p-8">
                <Steam />
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.24em] text-chili">{CHAPTERS[1].station}</p>
                <h2 data-chapter-heading className="font-display text-4xl font-bold leading-none tracking-tighter text-fg md:text-5xl">
                  <Lines text={"Folded by hand,\nevery afternoon."} />
                </h2>
                <p data-chapter-extra className="mt-5 text-base leading-relaxed text-fg-dim">
                  {CHAPTERS[1].body}
                </p>
                <div data-chapter-extra className="mt-6 flex flex-wrap gap-3">
                  {CHAPTERS[1].tags.map((t) => (
                    <span key={t} className="border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-faint">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 03 SPICE: the register */}
        <section style={{ height: `${heights[2]}vh` }} className="relative">
          <div data-chapter-panel data-fx="sear" className="sticky top-0 flex min-h-dvh items-center">
            <div data-chapter-content className="mx-auto w-full max-w-7xl px-5 md:px-8 lg:pl-24">
              <div className="relative max-w-lg">
                <FilmScrim />
                <Station label={CHAPTERS[2].station} />
                <h2 data-chapter-heading className="on-film font-display text-4xl font-bold leading-none tracking-tighter md:text-6xl">
                  <Lines text={"Timmur does\nthe talking."} />
                </h2>
                <p data-chapter-extra className="on-film-dim mt-5 max-w-[44ch] text-base leading-relaxed">
                  {CHAPTERS[2].body}
                </p>
                <div data-chapter-extra data-chapter-card className="glass mt-8 p-5">
                  <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-fg-dim">
                    <span className="flex items-center gap-2">
                      <Flame className="h-3.5 w-3.5 text-chili" /> Heat register
                    </span>
                    <span>
                      <span ref={heatRef} className="text-fg">0</span>
                      <span className="text-fg-faint"> scoville, approx.</span>
                    </span>
                  </div>
                  <div className="docket-rule mt-4" />
                  <p className="mt-4 font-mono text-[11px] leading-relaxed text-fg-faint">
                    Jhol achar, our signature broth chutney, sits at a warm middle heat. Ask the kitchen to turn it up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 04 FIRE: the bar */}
        <section style={{ height: `${heights[3]}vh` }} className="relative">
          <div data-chapter-panel data-fx="bloom" className="sticky top-0 flex min-h-dvh items-end justify-center">
            <div data-chapter-content className="relative mx-auto w-full max-w-3xl px-5 pb-28 text-center md:px-8">
              <FilmScrim strong />
              <Station label={CHAPTERS[3].station} center />
              <h2 className="on-film font-display text-4xl font-bold leading-none tracking-tighter md:text-6xl">
                <Lines text={"The bar leans in."} />
              </h2>
              <p data-chapter-extra className="on-film-dim mx-auto mt-5 max-w-[48ch] text-base leading-relaxed">
                {CHAPTERS[3].body}
              </p>
              <p data-chapter-extra className="on-film-dim mt-6 font-mono text-[11px] uppercase tracking-[0.2em]">
                Momo and a martini is a valid order here.
              </p>
            </div>
          </div>
        </section>

        {/* 05 TABLE: the climax */}
        <section style={{ height: `${heights[4]}vh` }} className="relative">
          <div data-chapter-panel data-fx="grand" className="sticky top-0 flex min-h-dvh flex-col justify-center">
            <div data-chapter-content className="relative mx-auto w-full max-w-4xl px-5 text-center md:px-8">
              <FilmScrim strong />
              <Station label={CHAPTERS[4].station} center />
              <h2 data-chapter-heading className="on-film font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-8xl">
                <Lines text={"The table\nis set."} />
              </h2>
              <p data-chapter-extra className="on-film-dim mx-auto mt-6 max-w-[40ch] text-lg leading-relaxed">
                {CHAPTERS[4].body}
              </p>
              <div data-chapter-extra className="mt-10 flex justify-center">
                <ReserveCta large />
              </div>
              <p data-chapter-extra className="on-film-dim mt-8 font-mono text-[11px] uppercase tracking-[0.18em]">
                Keep scrolling: the menu, the room, the reservation.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ACT 2: the real restaurant, on solid ground */}
      <ContentSections />

      <div className="relative z-10 bg-canvas-2">
        <div className="docket-rule mx-auto max-w-7xl" />
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-5 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-faint md:px-8">
          <span>Copyright {new Date().getFullYear()} The Mustang</span>
          <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-fg">
            {SITE.email}
          </a>
          <Link to="/prompt" className="transition-colors hover:text-fg">
            Prompt archive
          </Link>
        </div>
      </div>
    </div>
  );
}
