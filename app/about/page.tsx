import type { Metadata } from "next";
import Image from "next/image";
import { existsSync } from "node:fs";
import path from "node:path";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { FAQS, SITE, STORY } from "../../src/config/site";
import ReviewsSection from "../../src/components/ReviewsSection";

export const metadata: Metadata = {
  title: "Our Story | Nepalese Dining in Farrer | The Mustang",
  description:
    "The story behind The Mustang, a Nepalese restaurant and bar at 4 Farrer Place, Farrer ACT. Himalayan recipes, a warm room, hours, directions and guest reviews.",
  alternates: { canonical: "/about" },
};

// The real map image is dropped in later at public/assets/map.png. Detecting it
// at render time (server component) keeps /about a pure server page while still
// falling back to a styled panel when the file is absent, no client JS needed.
const MAP_SRC = "/assets/map.png";
const mapExists = existsSync(path.join(process.cwd(), "public", "assets", "map.png"));

// FAQPage structured data generated from the FAQS config, mirroring the Q/A
// rendered below so the markup and the schema never drift.
const FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.a,
    },
  })),
};

export default function AboutPage() {
  return (
    <main className="bg-canvas text-fg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />
      {/* Story */}
      <section className="paper-texture border-b border-line pb-28 pt-10 md:pb-36 md:pt-14">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <p className="mb-6 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-fg-faint">01</span>
            <span className="text-chili">{STORY.eyebrow}</span>
          </p>
          <h1 className="max-w-[18ch] font-display text-4xl font-extrabold leading-[1.02] tracking-tighter md:text-6xl">
            {STORY.lead}
          </h1>
          <div className="docket-rule mt-10 max-w-md" />
          <p className="mt-10 max-w-[62ch] text-lg leading-relaxed text-fg-dim md:text-xl">
            {STORY.body}
          </p>
        </div>
      </section>

      {/* Find us */}
      <section
        aria-labelledby="find-us-heading"
        className="border-b border-line bg-canvas py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="mb-4 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-fg-faint">02</span>
            <span className="text-chili">Find us</span>
          </p>
          <h2
            id="find-us-heading"
            className="mb-12 font-display text-4xl font-extrabold leading-[0.98] tracking-tighter md:text-5xl"
          >
            Dinner in Farrer, seven nights a week
          </h2>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            {/* Details */}
            <div className="flex flex-col">
              <div>
                <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-chili">
                  <MapPin className="h-3.5 w-3.5" /> Address
                </p>
                <p className="text-lg leading-relaxed text-fg-dim">{SITE.address}</p>
              </div>

              <div className="mt-8">
                <p className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-chili">
                  <Clock className="h-3.5 w-3.5" /> Hours
                </p>
                <p className="text-lg leading-relaxed text-fg-dim">{SITE.hours}</p>
              </div>

              <div className="docket-rule my-8" />

              <a
                href={SITE.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cta-shimmer relative inline-flex w-fit items-center gap-3 overflow-hidden bg-chili px-7 py-4 font-display text-base font-bold tracking-tight text-cream transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Get directions
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {/* Map image slot, styled fallback if the file is absent */}
            <div className="relative aspect-[16/10] w-full overflow-hidden border border-line bg-canvas-3">
              {mapExists ? (
                <Image
                  src={MAP_SRC}
                  alt={`Map showing The Mustang at ${SITE.address}`}
                  fill
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgba(200,53,59,0.16),transparent_65%)] p-8 text-center">
                  <MapPin className="h-9 w-9 text-chili" />
                  <p className="mt-5 font-display text-xl font-bold tracking-tight text-fg">
                    {SITE.brand}
                  </p>
                  <p className="mt-1.5 max-w-[28ch] text-sm leading-relaxed text-fg-dim">
                    {SITE.address}
                  </p>
                  <a
                    href={SITE.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-2 border-b border-line pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim transition-colors hover:border-chili hover:text-fg"
                  >
                    Open in Google Maps
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <ReviewsSection variant="full" id="reviews" />

      {/* FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="border-t border-line bg-canvas py-24 md:py-32"
      >
        <div className="mx-auto max-w-4xl px-5 md:px-8">
          <p className="mb-4 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-fg-faint">06</span>
            <span className="text-chili">Good to know</span>
          </p>
          <h2
            id="faq-heading"
            className="mb-12 font-display text-4xl font-extrabold leading-[0.98] tracking-tighter md:text-5xl"
          >
            Questions, answered
          </h2>

          {/* Native <details> so the Q/A is accessible and keyboard-operable
             with no client JS. Clean Q/A structure for the FAQPage JSON-LD the
             integrator adds later. */}
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((f, i) => (
              <details key={f.q} className="group">
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[11px] text-fg-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-bold tracking-tight text-fg-dim transition-colors group-hover:text-fg group-open:text-fg md:text-2xl">
                      {f.q}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 self-center font-display text-2xl leading-none text-chili transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-[62ch] pb-7 pl-9 text-base leading-relaxed text-fg-dim">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
