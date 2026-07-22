import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook } from "lucide-react";
import { SITE } from "../config/site";

/**
 * Site-wide footer in the docket language. Carries the full NAP block (name,
 * address, both phones, email) and hours on every page, which is a local SEO
 * signal in itself, plus columns of page links, a map link and social
 * placeholders. Server component: no client hooks, only next/link.
 */

const PAGES = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/catering", label: "Catering" },
  { href: "/reserve", label: "Reserve" },
  { href: "/prompt", label: "Prompt archive" },
] as const;

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-canvas-2 text-fg">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        {/* NAP + hours */}
        <div>
          <p className="font-display text-xl font-extrabold tracking-tight">
            {SITE.brand}
          </p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-faint">
            {SITE.place}
          </p>

          <address className="mt-5 space-y-2.5 not-italic text-sm text-fg-dim">
            <a
              href={SITE.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2.5 transition-colors hover:text-chili"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-chili" />
              <span>{SITE.address}</span>
            </a>
            <a
              href={SITE.phoneHref}
              className="flex items-center gap-2.5 transition-colors hover:text-chili"
            >
              <Phone className="h-4 w-4 shrink-0 text-chili" />
              <span>{SITE.phone}</span>
            </a>
            <a
              href={SITE.phoneAltHref}
              className="flex items-center gap-2.5 transition-colors hover:text-chili"
            >
              <Phone className="h-4 w-4 shrink-0 text-chili" />
              <span>{SITE.phoneAlt}</span>
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="flex items-center gap-2.5 break-all transition-colors hover:text-chili"
            >
              <Mail className="h-4 w-4 shrink-0 text-chili" />
              <span>{SITE.email}</span>
            </a>
            <p className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-chili" />
              <span>{SITE.hours}</span>
            </p>
          </address>
        </div>

        {/* Page links */}
        <nav aria-label="Footer">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-faint">
            Explore
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PAGES.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="text-fg-dim transition-colors hover:text-chili"
                >
                  {page.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={SITE.orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-dim transition-colors hover:text-chili"
              >
                Takeaway
              </a>
            </li>
          </ul>
        </nav>

        {/* Find us */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-fg-faint">
            Find us
          </p>
          <a
            href={SITE.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm text-fg-dim transition-colors hover:text-chili"
          >
            <MapPin className="h-4 w-4 text-chili" />
            Get directions
          </a>

          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-fg-faint">
            Social
          </p>
          <div className="mt-3 flex items-center gap-3">
            {/* Placeholders until the owner confirms handles. */}
            <a
              href={SITE.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram (coming soon)"
              className="flex h-9 w-9 items-center justify-center border border-line text-fg-dim transition-colors hover:border-chili hover:text-chili"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href={SITE.orderUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook (coming soon)"
              className="flex h-9 w-9 items-center justify-center border border-line text-fg-dim transition-colors hover:border-chili hover:text-chili"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>

          <Link
            href="/reserve"
            className="mt-6 inline-block bg-chili px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-chili-deep"
          >
            Reserve a table
          </Link>
        </div>
      </div>

      <div className="docket-rule mx-auto max-w-7xl px-5" />
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 text-center md:flex-row md:px-8 md:text-left">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">
          {"©"} {year} {SITE.brand}. {SITE.tagline}.
        </p>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">
          {SITE.hoursShort}
        </p>
      </div>
    </footer>
  );
}
