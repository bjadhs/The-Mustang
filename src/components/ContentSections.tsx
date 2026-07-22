"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, Clock, Mail, MapPin, Phone, Plus, Utensils } from "lucide-react";
import { useReservationDialog } from "./ReservationDialog";
import {
  FAQS,
  MENU_CATEGORIES,
  SERVICES,
  SIGNATURE_DISHES,
  SITE,
  STORY,
  TABLE_POSTER_SRC,
  TABLE_VIDEO_SRC,
  type Dish,
} from "../config/site";

/* Fires transform-only reveals on mount, never gated on opacity-0. */
function useReveal() {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.shown = "true";
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16 },
    );
    el.querySelectorAll("[data-reveal]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
  return ref;
}

const REVEAL =
  "translate-y-7 opacity-0 transition-all duration-700 ease-out data-[shown=true]:translate-y-0 data-[shown=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100";

/* Editorial section header: act index in mono, eyebrow in chili. */
function SectionMark({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
      <span className="text-fg-faint">{index}</span>
      <span className="text-chili">{children}</span>
    </p>
  );
}

function ReserveButton({ large = false }: { large?: boolean }) {
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

/* The seam between the film and solid ground: a rolling board of dish names. */
function MarqueeBand() {
  const names = [
    ...SIGNATURE_DISHES.map((d) => d.name),
    "Mustang Lager",
    "From the tandoor",
    "Jhol achar",
  ];
  return (
    <section
      aria-hidden="true"
      className="marquee border-b border-line bg-canvas-2 py-7 md:py-9"
    >
      <div
        className="marquee-track flex w-max items-center"
        style={{ "--marquee-duration": "36s" } as React.CSSProperties}
      >
        {[0, 1].map((dup) => (
          <div key={dup} className="flex shrink-0 items-center">
            {names.map((name, i) => (
              <span
                key={`${name}-${i}`}
                className="flex items-center whitespace-nowrap font-display text-4xl font-extrabold leading-none tracking-tighter md:text-6xl"
              >
                <span
                  className={
                    i % 2 === 0
                      ? "text-fg"
                      : "text-transparent [-webkit-text-stroke:1.5px_var(--m-fg-faint)]"
                  }
                >
                  {name}
                </span>
                <span className="mx-6 text-2xl text-chili md:mx-8 md:text-3xl">✳</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* Dish image with graceful fallback to a monogram tile if the file is absent. */
function DishImage({ dish }: { dish: Dish }) {
  const [failed, setFailed] = useState(!dish.image);
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas-3">
      {!failed && dish.image ? (
        <Image
          src={`/assets/food/${dish.image}`}
          alt={dish.name}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          loading="lazy"
          onError={() => setFailed(true)}
          className="object-cover transition-transform duration-700 will-change-transform group-hover:scale-[1.06]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(200,53,59,0.18),transparent_60%)]">
          <Utensils className="h-10 w-10 text-chili/60" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0c0e11]/55 via-transparent to-transparent" />
      <span className="absolute right-3 top-3 -rotate-2 bg-chili px-2.5 py-1 font-mono text-[11px] font-medium text-cream shadow-sm">
        {dish.price}
      </span>
    </div>
  );
}

function Story() {
  const ref = useReveal();
  return (
    <section ref={ref} id="story" className="paper-texture bg-canvas py-28 md:py-40">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[auto_1fr] md:gap-16">
          <div data-reveal className={REVEAL}>
            <span className="block font-display text-6xl font-extrabold leading-none tracking-tighter text-chili/25 md:text-8xl">
              01
            </span>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.24em] text-chili [writing-mode:vertical-rl] md:mt-6">
              {STORY.eyebrow}
            </p>
          </div>
          <div data-reveal className={REVEAL}>
            <h2 className="max-w-[18ch] font-display text-4xl font-extrabold leading-[1.02] tracking-tighter md:text-6xl">
              {STORY.lead}
            </h2>
            <div className="docket-rule mt-10 max-w-md" />
            <p className="mt-10 max-w-[58ch] text-lg leading-relaxed text-fg-dim md:text-xl">
              {STORY.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SignatureDishes() {
  const ref = useReveal();
  return (
    <section ref={ref} id="dishes" className="border-t border-line bg-canvas py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionMark index="02">Savour every moment</SectionMark>
            <h2 className="max-w-[16ch] font-display text-4xl font-extrabold leading-[0.98] tracking-tighter md:text-6xl">
              The dishes worth the drive to Farrer
            </h2>
          </div>
          <a
            href={SITE.menuUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 border-b border-line pb-1 font-mono text-xs uppercase tracking-[0.18em] text-fg-dim transition-colors hover:border-chili hover:text-fg"
          >
            See the full menu
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        {/* Staggered editorial grid: the middle column drops on desktop. */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {SIGNATURE_DISHES.map((dish, i) => (
            <article
              key={dish.name}
              data-reveal
              className={`group ${REVEAL} ${i % 3 === 1 ? "lg:mt-16" : ""}`}
            >
              <div className="transition-transform duration-500 will-change-transform group-hover:-translate-y-1.5 motion-reduce:transform-none">
                <DishImage dish={dish} />
              </div>
              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-chili">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight">{dish.name}</h3>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-fg-dim">{dish.desc}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {dish.tags.map((t) => (
                  <span
                    key={t}
                    className="border border-line px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-fg-faint"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MenuOverview() {
  const ref = useReveal();
  return (
    <section ref={ref} id="menu" className="border-t border-line bg-canvas-2 py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          {/* Sticky menu-board masthead. */}
          <div>
            <div className="lg:sticky lg:top-28">
              <SectionMark index="03">The whole table</SectionMark>
              <h2 className="font-display text-4xl font-extrabold leading-[0.98] tracking-tighter md:text-6xl">
                From mo:mo to the bar
              </h2>
              <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-fg-dim">
                Six ways with dumplings, curries slow cooked with imported Himalayan spice, breads
                straight from the tandoor, and a bar built for the mountains. A taste of what is on.
              </p>
              <div className="mt-8 hidden lg:block">
                <ReserveButton />
              </div>
            </div>
          </div>

          {/* The board itself: category name big, note in mono, items as a run. */}
          <div className="border-t border-line">
            {MENU_CATEGORIES.map((cat) => (
              <div key={cat.name} data-reveal className={`border-b border-line py-9 ${REVEAL}`}>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h3 className="font-display text-3xl font-extrabold tracking-tighter md:text-4xl">
                    {cat.name}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-chili">
                    {cat.note}
                  </span>
                </div>
                <div className="docket-rule mt-5" />
                <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-2">
                  {cat.items.map((it, j) => (
                    <span key={it} className="flex items-baseline gap-x-3 text-sm text-fg-dim">
                      {j > 0 && <span className="text-chili/60">·</span>}
                      {it}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Services() {
  const ref = useReveal();
  return (
    <section ref={ref} id="services" className="border-t border-line bg-canvas py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-14 max-w-2xl">
          <SectionMark index="04">More than meals</SectionMark>
          <h2 className="font-display text-4xl font-extrabold leading-[0.98] tracking-tighter md:text-6xl">
            What The Mustang does
          </h2>
        </div>

        <div className="border-t border-line">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              data-reveal
              className={`group grid grid-cols-[auto_1fr] items-baseline gap-6 border-b border-line py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)_minmax(0,5fr)] md:gap-10 ${REVEAL}`}
            >
              <span className="font-display text-4xl font-extrabold leading-none tracking-tighter text-fg-faint transition-colors duration-300 group-hover:text-chili md:text-6xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                {s.title}
              </h3>
              <p className="col-span-2 text-sm leading-relaxed text-fg-dim md:col-span-1 md:text-base">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* The Reserve section: the beer table video plays as a muted loop behind the CTA. */
function Reserve() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const v = videoRef.current;
    if (v && !mq.matches) {
      v.play().catch(() => undefined);
    }
  }, []);

  return (
    <section id="reserve" className="relative isolate overflow-hidden border-t border-line">
      <div className="absolute inset-0 -z-10">
        {reduced ? (
          <img src={TABLE_POSTER_SRC} alt="" className="h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={TABLE_VIDEO_SRC}
            poster={TABLE_POSTER_SRC}
            muted
            loop
            playsInline
            preload="metadata"
            tabIndex={-1}
            aria-hidden="true"
          />
        )}
        {/* The film is dark: these scrims stay dark in both themes. */}
        <div className="absolute inset-0 bg-[#0c0e11]/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c0e11] via-[#0c0e11]/50 to-transparent" />
      </div>

      <div className="mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-center px-5 py-32 md:px-8">
        <div className="max-w-2xl">
          <p className="on-film-dim mb-4 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-chili">05 · Book your seat</span>
          </p>
          <h2 className="on-film font-display text-4xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
            A table, a mo:mo, and a cold Mustang lager
          </h2>
          <p className="on-film-dim mt-7 max-w-[46ch] text-base leading-relaxed md:text-lg">
            Seven nights a week in Farrer. Bring the people you like to feed, and let the kitchen
            take it from there.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <ReserveButton large />
            <a
              href={SITE.orderUrl}
              target="_blank"
              rel="noreferrer"
              className="on-film group inline-flex items-center gap-2 border border-cream/30 px-6 py-4 font-mono text-xs uppercase tracking-[0.16em] backdrop-blur-sm transition-colors hover:border-chili active:scale-[0.98]"
            >
              Order online
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faqs() {
  const ref = useReveal();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section ref={ref} id="faq" className="border-t border-line bg-canvas py-28 md:py-36">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <SectionMark index="06">Good to know</SectionMark>
        <h2 className="mb-14 font-display text-4xl font-extrabold leading-[0.98] tracking-tighter md:text-5xl">
          Some answers to your questions
        </h2>
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                data-reveal
                className="opacity-0 transition-opacity duration-500 data-[shown=true]:opacity-100 motion-reduce:opacity-100"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-baseline justify-between gap-6 py-7 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[11px] text-fg-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-lg font-bold tracking-tight transition-colors md:text-2xl ${
                        isOpen ? "text-fg" : "text-fg-dim group-hover:text-fg"
                      }`}
                    >
                      {f.q}
                    </span>
                  </span>
                  <Plus
                    className={`h-5 w-5 shrink-0 self-center text-chili transition-transform duration-300 motion-reduce:transition-none ${
                      isOpen ? "rotate-[135deg]" : "group-hover:rotate-90"
                    }`}
                  />
                </button>
                <div
                  className="grid transition-all duration-300 motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[60ch] pb-7 pl-9 text-base leading-relaxed text-fg-dim">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VisitFooter() {
  const ref = useReveal();
  return (
    <section ref={ref} id="visit" className="paper-texture border-t border-line bg-canvas-2">
      <div className="mx-auto max-w-7xl px-5 pb-16 pt-24 md:px-8 md:pt-32">
        <SectionMark index="07">Visit us</SectionMark>

        {/* The sign-off: the name at signage scale. */}
        <div data-reveal className={REVEAL}>
          <p className="font-display text-[17vw] font-extrabold leading-[0.85] tracking-tighter md:text-[11rem]">
            The Mustang
          </p>
          <p className="mt-3 font-display text-2xl font-bold tracking-tight text-fg-dim md:text-4xl">
            Nepalese Restaurant and Bar
            <span className="text-chili">.</span>
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 md:grid-cols-[auto_1fr] md:gap-20">
          <div data-reveal className={REVEAL}>
            <ReserveButton large />
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div data-reveal className={REVEAL}>
              <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-chili">
                <MapPin className="h-3.5 w-3.5" /> Address
              </p>
              <a
                href={SITE.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm leading-relaxed text-fg-dim transition-colors hover:text-fg"
              >
                {SITE.address}
              </a>
            </div>
            <div data-reveal className={REVEAL}>
              <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-chili">
                <Clock className="h-3.5 w-3.5" /> Hours
              </p>
              <p className="text-sm leading-relaxed text-fg-dim">{SITE.hoursShort}</p>
            </div>
            <div data-reveal className={REVEAL}>
              <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-chili">
                <Phone className="h-3.5 w-3.5" /> Call
              </p>
              <a
                href={SITE.phoneHref}
                className="block text-sm text-fg-dim transition-colors hover:text-fg"
              >
                {SITE.phone}
              </a>
              <a
                href={SITE.phoneAltHref}
                className="mt-1 block text-sm text-fg-dim transition-colors hover:text-fg"
              >
                {SITE.phoneAlt}
              </a>
            </div>
            <div data-reveal className={REVEAL}>
              <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-chili">
                <Mail className="h-3.5 w-3.5" /> Email
              </p>
              <a
                href={`mailto:${SITE.email}`}
                className="break-all text-sm text-fg-dim transition-colors hover:text-fg"
              >
                {SITE.email}
              </a>
            </div>
          </div>
        </div>

        <div className="docket-rule my-12" />
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-faint">
          <span>The Mustang, {SITE.place}</span>
          <span>A journey through Nepalese taste and spirit</span>
        </div>
      </div>
    </section>
  );
}

export default function ContentSections() {
  return (
    <div className="relative z-10 bg-canvas text-fg">
      <MarqueeBand />
      <Story />
      <SignatureDishes />
      <MenuOverview />
      <Services />
      <Reserve />
      <Faqs />
      <VisitFooter />
    </div>
  );
}
