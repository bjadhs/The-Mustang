import type { Metadata } from "next";
import { Clock, MapPin, Phone } from "lucide-react";
import ReserveForm from "../../src/components/ReserveForm";
import { SITE } from "../../src/config/site";

export const metadata: Metadata = {
  title: "Reserve a Table | The Mustang, Farrer ACT",
  description:
    "Book a table at The Mustang, a Nepalese restaurant and bar in Farrer, Canberra. Pick a seating preference on the floor plan and request your booking. Open 7 nights, 5:00pm to 9:30pm.",
  alternates: { canonical: "/reserve" },
};

// Server component: the h1, intro and metadata render on the server for SEO;
// the floor plan and booking form live inside the <ReserveForm/> client
// boundary, which co-locates both panels so the selected-table state is shared.
export default function ReservePage() {
  return (
    <main className="min-h-dvh bg-canvas text-fg">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
        {/* Masthead: short title + the three quick facts, sitting tight above
            the floor plan. */}
        <header className="mb-6 md:mb-8">
          <p className="mb-3 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-fg-faint">01</span>
            <span className="text-chili">Book your seat</span>
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-[1.0] tracking-tighter md:text-4xl">
            Reserve a table
          </h1>

          {/* Quick facts: open, location, phone. */}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">
            <span className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-chili" /> {SITE.hoursShort}
            </span>
            <a href={SITE.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors hover:text-fg">
              <MapPin className="h-3.5 w-3.5 text-chili" /> {SITE.address}
            </a>
            <a href={SITE.phoneHref} className="flex items-center gap-2 transition-colors hover:text-fg">
              <Phone className="h-3.5 w-3.5 text-chili" /> {SITE.phone}
            </a>
          </div>
        </header>

        {/* The interactive pair: floor plan + form. */}
        <ReserveForm />
      </div>
    </main>
  );
}
