import type { Metadata } from "next";
import { menuByCategory } from "../../src/config/menu";
import { SITE } from "../../src/config/site";
import MenuView from "../../src/components/MenuView";

// The /menu route. A server component so the full menu, the copy and the Menu
// JSON-LD all render on the server for SEO. The interactive rail, filters and
// search live inside the <MenuView/> client boundary, which reads the same
// menu config, so the visible list can never drift from the structured data.

export const metadata: Metadata = {
  // `absolute` overrides the layout title template so the SEO title is exact.
  title: {
    absolute: "Menu | Nepalese Food in Canberra | The Mustang",
  },
  description:
    "The full menu at The Mustang, a Nepalese restaurant and bar in Farrer, Canberra. Hand pleated momo, curries, thali sets, tandoor breads and mountain drinks.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Menu | Nepalese Food in Canberra | The Mustang",
    description:
      "Hand pleated momo, Himalayan curries and thali sets. The full menu of The Mustang, a Nepalese restaurant and bar in Farrer, Canberra.",
    url: "/menu",
    type: "website",
    images: [
      {
        url: "/assets/food/thali.png",
        width: 1200,
        height: 900,
        alt: "The Mustang thali set, a full Nepalese dinner",
      },
    ],
  },
};

/** Pull the numeric value out of a display price like "$16.50" or "from $10.00". */
function priceValue(price: string): string {
  const match = price.match(/(\d+(?:\.\d+)?)/);
  return match ? match[1] : "0";
}

export default function MenuPage() {
  const sections = menuByCategory();

  // Menu -> hasMenuSection[] -> hasMenuItem[], generated from the same config
  // that MenuView renders, so the JSON-LD and the visible menu stay in lockstep.
  const menuJsonLd = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `${SITE.brand} Menu`,
    inLanguage: "en-AU",
    url: "https://themustangcanberra.com.au/menu",
    hasMenuSection: sections.map(({ meta, items }) => ({
      "@type": "MenuSection",
      name: meta.name,
      description: meta.note,
      hasMenuItem: items.map((item) => ({
        "@type": "MenuItem",
        name: item.name,
        description: item.desc,
        offers: {
          "@type": "Offer",
          price: priceValue(item.price),
          priceCurrency: "AUD",
        },
      })),
    })),
  };

  return (
    <main className="bg-canvas text-fg">
      <script
        type="application/ld+json"
        // Server-rendered structured data, generated from menuByCategory().
        dangerouslySetInnerHTML={{ __html: JSON.stringify(menuJsonLd) }}
      />

      {/* Masthead. Server rendered so all menu copy is in the initial HTML. */}
      <header className="paper-texture border-b border-line bg-canvas">
        <div className="mx-auto max-w-6xl px-5 pb-12 pt-10 md:px-8 md:pb-16 md:pt-14">
          <p className="mb-4 flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
            <span className="text-fg-faint">Farrer ACT 2607</span>
            <span className="text-chili">The full menu</span>
          </p>
          <h1 className="max-w-[16ch] font-display text-5xl font-extrabold leading-[0.95] tracking-tighter md:text-7xl">
            Nepalese food, cooked in Farrer
          </h1>
          <div className="docket-rule mt-9 max-w-md" />
          <p className="mt-9 max-w-[62ch] text-lg leading-relaxed text-fg-dim md:text-xl">
            Every dish The Mustang serves, from hand pleated momo and slow cooked
            Himalayan curries to thali sets, tandoor breads and a mountain bar.
            Filter by what you eat, dial the spice to your liking, and search for
            a favourite. Prices are in Australian dollars.
          </p>
        </div>
      </header>

      <MenuView />
    </main>
  );
}
