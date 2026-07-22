import type { Metadata } from "next";
import Script from "next/script";
import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SiteNav from "../src/components/SiteNav";
import Footer from "../src/components/Footer";

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
    <html lang="en">
      <body
        className={`${bricolage.variable} ${interTight.variable} ${jetbrainsMono.variable}`}
      >
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <SiteNav />
        {children}
        <Footer />
        {/* <Concierge/> mounted by concierge agent */}
      </body>
    </html>
  );
}
