import type { Metadata } from "next";
import { CalendarHeart, PartyPopper, Truck, Utensils } from "lucide-react";
import { SERVICES, SITE } from "../../src/config/site";
import CateringEnquiryForm from "../../src/components/CateringEnquiryForm";

export const metadata: Metadata = {
  title: "Nepalese Catering in Canberra | The Mustang",
  description:
    "Nepalese catering and private events in Canberra from The Mustang, Farrer. Banquet menus from $20 per plate, celebrations in our room or off site. Send an enquiry.",
  alternates: { canonical: "/catering" },
};

// Copy anchored to the real SERVICES data so the page can never drift from the
// single source of truth. We surface the catering, private-events and takeaway
// lines rather than hardcoding fresh marketing prose.
const cateringService = SERVICES.find((s) => s.title === "Catering");
const eventsService = SERVICES.find((s) => s.title === "Private events and celebrations");

const OFFERINGS = [
  {
    icon: Utensils,
    title: "Banquet menus from $20 per plate",
    desc:
      cateringService?.desc ??
      "Feeding a crowd off site, with banquet menus starting at $20 per plate.",
  },
  {
    icon: PartyPopper,
    title: "Private events and celebrations",
    desc:
      eventsService?.desc ??
      "Birthdays, gatherings and cultural nights, hosted with genuine Nepalese warmth.",
  },
  {
    icon: Truck,
    title: "Off-site catering",
    desc: "We bring the Himalayan kitchen to your venue, packed to travel and served warm, from momo platters to full thali spreads.",
  },
] as const;

export default function CateringPage() {
  return (
    <main className="bg-canvas text-fg">
      {/* Hero */}
      <section className="paper-texture border-b border-line pb-28 pt-10 md:pb-36 md:pt-14">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <p className="mb-6 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-fg-faint">01</span>
            <span className="text-chili">Catering and events</span>
          </p>
          <h1 className="max-w-[16ch] font-display text-4xl font-extrabold leading-[1.0] tracking-tighter md:text-7xl">
            Nepalese catering for your table, anywhere in Canberra
          </h1>
          <div className="docket-rule mt-10 max-w-md" />
          <p className="mt-10 max-w-[60ch] text-lg leading-relaxed text-fg-dim md:text-xl">
            From hand-pleated momo to full thali spreads, we cater birthdays,
            gatherings and cultural nights with the same Himalayan spice and warm
            welcome we pour every evening in Farrer. Banquet menus start at $20
            per plate, in our room or off site at your venue.
          </p>
        </div>
      </section>

      {/* Offerings */}
      <section
        aria-labelledby="offerings-heading"
        className="border-b border-line bg-canvas py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="mb-4 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-fg-faint">02</span>
            <span className="text-chili">What we cater</span>
          </p>
          <h2
            id="offerings-heading"
            className="mb-14 max-w-[20ch] font-display text-4xl font-extrabold leading-[0.98] tracking-tighter md:text-5xl"
          >
            One kitchen, built for a crowd
          </h2>

          <div className="border-t border-line">
            {OFFERINGS.map((o, i) => {
              const Icon = o.icon;
              return (
                <div
                  key={o.title}
                  className="grid grid-cols-[auto_1fr] items-baseline gap-6 border-b border-line py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,5fr)_minmax(0,5fr)] md:gap-10"
                >
                  <span className="flex items-center gap-4 font-display text-4xl font-extrabold leading-none tracking-tighter text-fg-faint md:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                    <Icon className="h-6 w-6 text-chili md:h-7 md:w-7" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-xl font-bold tracking-tight md:text-2xl">
                    {o.title}
                  </h3>
                  <p className="col-span-2 text-sm leading-relaxed text-fg-dim md:col-span-1 md:text-base">
                    {o.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section
        aria-labelledby="enquiry-heading"
        className="bg-canvas-2 py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <p className="mb-4 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
                <span className="text-fg-faint">03</span>
                <span className="text-chili">Start the conversation</span>
              </p>
              <h2
                id="enquiry-heading"
                className="font-display text-4xl font-extrabold leading-[0.98] tracking-tighter md:text-5xl"
              >
                Tell us about your event
              </h2>
              <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-fg-dim">
                Send the details below and the kitchen will build a menu around
                your numbers, your date and any dietary needs. This is an enquiry
                to open the conversation, not a confirmed booking. We reply to
                talk it through and send a quote.
              </p>
              <p className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fg-faint">
                <CalendarHeart className="h-3.5 w-3.5 text-chili" />
                {SITE.hoursShort}
              </p>
            </div>

            <CateringEnquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
