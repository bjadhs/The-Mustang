import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "../src/components/SiteNav";
import Footer from "../src/components/Footer";
import Concierge from "../src/components/Concierge";
import { SITE, GEO, POSTER_SOURCES } from "../src/config/site";

// Display face. The current app uses Bricolage Grotesque as --font-display
// (see src/styles.css @theme). Cabinet Grotesk is not on Google Fonts and no
// local font files ship in this repo, so we keep exact parity with Bricolage.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-tight",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://themustangcanberra.com.au"),
  title: {
    default: "The Mustang, Canberra. A Journey Through Nepalese Taste and Spirit",
    template: "%s | The Mustang, Canberra",
  },
  description:
    "Nepalese restaurant and bar at 4 Farrer Place, Farrer ACT. Hand-pleated momo, Himalayan spice and a bar that leans in. Open 7 nights, 5:00pm to 9:30pm. Reserve a table.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.brand,
    url: "/",
    title: "The Mustang, Canberra. A Journey Through Nepalese Taste and Spirit",
    description:
      "Nepalese restaurant and bar at 4 Farrer Place, Farrer ACT. Hand-pleated momo, Himalayan spice and a bar that leans in. Open 7 nights, 5:00pm to 9:30pm.",
    locale: "en_AU",
    images: [{ url: POSTER_SOURCES[0], alt: `${SITE.brand}, Nepalese restaurant and bar in Farrer` }],
  },
};

// Site-wide Restaurant JSON-LD, built from SITE + GEO. No aggregateRating: the
// reviews shipped in config are labeled placeholder/sample, so faking a rating
// here would be dishonest and a structured-data violation.
const RESTAURANT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "@id": "https://themustangcanberra.com.au/#restaurant",
  name: SITE.brand,
  url: "https://themustangcanberra.com.au/",
  telephone: SITE.phoneHref.replace("tel:", ""),
  email: SITE.email,
  image: `https://themustangcanberra.com.au${POSTER_SOURCES[0]}`,
  servesCuisine: "Nepalese",
  priceRange: "$$",
  acceptsReservations: true,
  hasMenu: "https://themustangcanberra.com.au/menu",
  address: {
    "@type": "PostalAddress",
    streetAddress: "4 Farrer Place",
    addressLocality: "Farrer",
    addressRegion: "ACT",
    postalCode: "2607",
    addressCountry: "AU",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: GEO.lat,
    longitude: GEO.lng,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "17:00",
      closes: "21:30",
    },
  ],
};

// Pre-paint theme boot. Sets data-theme on <html> from localStorage or the OS
// preference before first paint (no theme flash), and ensures the
// #meta-theme-color element useTheme() updates exists. Ported from the old
// index.html inline script; useTheme owns runtime flips from here.
const THEME_INIT = `(function(){var t=null;try{t=localStorage.getItem("mustang-theme");}catch(e){}if(t!=="dark"&&t!=="light"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-theme",t);var c=t==="light"?"#f4ede0":"#14181d";var m=document.getElementById("meta-theme-color");if(!m){m=document.createElement("meta");m.setAttribute("name","theme-color");m.id="meta-theme-color";document.head.appendChild(m);}m.setAttribute("content",c);})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: the beforeInteractive theme-init script sets
    // data-theme on <html> before hydration, so the DOM legitimately differs
    // from the server markup on this one element. This is the standard
    // no-flash theme pattern and the diff is intentional.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bricolage.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(RESTAURANT_JSONLD) }}
        />
        <SiteNav />
        {children}
        <Footer />
        <Concierge />
      </body>
    </html>
  );
}
