import { ArrowUpRight, Star } from "lucide-react";
import { REVIEWS, SITE, type Review } from "../config/site";

/**
 * Google-style reviews, rendered from the REVIEWS placeholder array in site.ts.
 *
 * IMPORTANT honesty guardrail: REVIEWS are SAMPLE placeholders, not live Google
 * data (PLAN Phase 6 wires the real Places feed). This component never presents
 * an authoritative aggregate rating: it computes the average of the sample data
 * and labels it "sample", and renders a small caption saying so. Do not feed
 * these numbers into AggregateRating JSON-LD.
 *
 * Two variants via the `variant` prop:
 *   - "band": slim, compact. Aggregate stars + count + two short quotes. Built
 *     for the landing page, between the dishes and reserve sections.
 *   - "full": aggregate header + every review as a card (author, stars,
 *     relative date, quote). Built for /about.
 *
 * Server component: pure render, no client hooks. lucide Star icons.
 */

export interface ReviewsSectionProps {
  /** "band" for the slim landing strip, "full" for the /about section. */
  variant: "band" | "full";
  /** Optional id for anchor links (e.g. "reviews"). */
  id?: string;
}

const MAX_STARS = 5;

function averageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0;
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return total / reviews.length;
}

/** A row of five stars, filled up to `value` (rounded), the rest outlined. */
function Stars({ value, className = "h-4 w-4" }: { value: number; className?: string }) {
  const filled = Math.round(value);
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden="true">
      {Array.from({ length: MAX_STARS }, (_, i) => (
        <Star
          key={i}
          className={`${className} ${i < filled ? "fill-chili text-chili" : "text-fg-faint"}`}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

function GoogleLink() {
  return (
    <a
      href={SITE.mapUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-2 border-b border-line pb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim transition-colors hover:border-chili hover:text-fg"
    >
      Review us on Google
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
}

/* ---------------- Band: the slim landing strip ---------------- */

function ReviewsBand({ id }: { id?: string }) {
  const avg = averageRating(REVIEWS);
  const quotes = REVIEWS.slice(0, 3);

  return (
    <section
      id={id}
      aria-label="Guest reviews"
      className="border-t border-line bg-canvas-2 py-16 md:py-20"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)] lg:items-center lg:gap-16">
          {/* Aggregate */}
          <div className="lg:border-r lg:border-line lg:pr-16">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-chili">
              What guests say
            </p>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-5xl font-extrabold leading-none tracking-tighter md:text-6xl">
                {avg.toFixed(1)}
              </span>
              <div>
                <Stars value={avg} className="h-4 w-4 md:h-5 md:w-5" />
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">
                  {REVIEWS.length} sample reviews
                </p>
              </div>
            </div>
            <p className="mt-4 max-w-[30ch] font-mono text-[10px] leading-relaxed tracking-[0.08em] text-fg-faint">
              Sample reviews shown until our live Google feed is connected.
            </p>
            <div className="mt-5">
              <GoogleLink />
            </div>
          </div>

          {/* Two to three short quotes */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {quotes.map((r) => (
              <figure key={r.author} className="flex flex-col">
                <Stars value={r.rating} className="h-3.5 w-3.5" />
                <blockquote className="mt-3 text-sm leading-relaxed text-fg-dim">
                  {r.quote}
                </blockquote>
                <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">
                  {r.author}
                  <span className="mx-1.5 text-chili/60">·</span>
                  <span className="normal-case tracking-normal">sample</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Full: the /about section ---------------- */

function ReviewsFull({ id }: { id?: string }) {
  const avg = averageRating(REVIEWS);

  return (
    <section
      id={id}
      aria-label="Guest reviews"
      className="border-t border-line bg-canvas-2 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Aggregate header */}
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <p className="mb-4 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
              <span className="text-fg-faint">05</span>
              <span className="text-chili">In their words</span>
            </p>
            <div className="flex items-baseline gap-4">
              <span className="font-display text-6xl font-extrabold leading-none tracking-tighter md:text-7xl">
                {avg.toFixed(1)}
              </span>
              <div>
                <Stars value={avg} className="h-5 w-5" />
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">
                  Average of {REVIEWS.length} sample reviews
                </p>
              </div>
            </div>
          </div>
          <GoogleLink />
        </div>

        <p className="mt-6 max-w-[52ch] font-mono text-[11px] leading-relaxed tracking-[0.06em] text-fg-faint">
          These are sample reviews, shown as a placeholder until our live Google
          feed is connected. They are not a verified rating.
        </p>

        <div className="docket-rule mt-10" />

        {/* Every review as a card */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <figure
              key={r.author}
              className="flex flex-col border border-line border-t-2 border-t-chili bg-canvas p-6"
            >
              <div className="flex items-center justify-between">
                <Stars value={r.rating} className="h-4 w-4" />
                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-fg-faint">
                  {String(i + 1).padStart(2, "0")} · sample
                </span>
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-fg-dim">
                {r.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-baseline justify-between gap-3 border-t border-line pt-4">
                <span className="font-display text-base font-bold tracking-tight text-fg">
                  {r.author}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
                  {r.date}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ReviewsSection({ variant, id }: ReviewsSectionProps) {
  return variant === "band" ? <ReviewsBand id={id} /> : <ReviewsFull id={id} />;
}
