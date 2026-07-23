"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Menu as MenuIcon, X } from "lucide-react";
import { SITE, ANNOUNCEMENT } from "../config/site";
import ThemeToggle from "./ThemeToggle";

/**
 * Site-wide header for the multi-page site, in the kitchen-docket language of
 * the film nav: brand stamp on the left, mono page links in the centre, and the
 * phone plus the single chili conversion action on the right.
 *
 * The Reserve a table button is the rightmost element on every breakpoint and
 * never collapses into the mobile sheet. On small screens the page links and
 * phone live behind a hamburger sheet; Reserve and the theme toggle stay out.
 *
 * An optional announcement strip renders above the bar when ANNOUNCEMENT is a
 * non-empty string. The landing route may visually hide this header itself; it
 * is not special-cased here.
 */

const LINKS = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/catering", label: "Catering" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteNav() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  // Close the sheet whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      {ANNOUNCEMENT ? (
        <div className="bg-chili text-cream">
          <p className="mx-auto max-w-7xl px-5 py-1.5 text-center font-mono text-[11px] uppercase tracking-[0.16em] md:px-8">
            {ANNOUNCEMENT}
          </p>
        </div>
      ) : null}

      <div className="glass">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          {/* Brand */}
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-tight text-fg"
          >
            The&nbsp;Mustang
            <span className="ml-2 hidden font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-fg-faint sm:inline">
              Farrer ACT
            </span>
          </Link>

          {/* Center page links (desktop) */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                    active ? "text-fg" : "text-fg-faint hover:text-fg-dim"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute inset-x-3 bottom-1 h-px origin-left bg-chili transition-transform duration-300 ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right cluster */}
          <div className="flex items-center gap-2">
            {/* Phone, tap to call. Hidden on mobile (lives in the sheet). */}
            <a
              href={SITE.phoneHref}
              className="group hidden items-center gap-2 border border-line px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg transition-colors hover:border-chili active:scale-[0.98] md:flex"
            >
              <Phone className="h-3.5 w-3.5 text-chili transition-transform group-hover:rotate-12" />
              <span>{SITE.phone}</span>
            </a>

            {/* Reserve: rightmost, always visible, single chili action. */}
            <Link
              href="/reserve"
              className="cta-shimmer relative overflow-hidden bg-chili px-3.5 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-chili-deep active:scale-[0.98] sm:px-4"
            >
              <span className="hidden sm:inline">Reserve a table</span>
              <span className="sm:hidden">Reserve</span>
            </Link>

            {/* Night/day, sits to the right of the Reserve action. */}
            <ThemeToggle docked />

            {/* Hamburger (mobile only). */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="site-nav-sheet"
              className="flex h-9 w-9 items-center justify-center border border-line text-fg transition-colors hover:border-chili md:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="docket-rule mx-auto max-w-7xl px-5" />
      </div>

      {/* Mobile sheet */}
      {open ? (
        <div
          id="site-nav-sheet"
          className="glass border-t border-line md:hidden"
        >
          <nav className="mx-auto flex max-w-7xl flex-col px-5 py-2" aria-label="Primary">
            {LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`border-b border-line py-3 font-mono text-[13px] uppercase tracking-[0.14em] transition-colors ${
                    active ? "text-chili" : "text-fg hover:text-chili"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <a
              href={SITE.phoneHref}
              className="flex items-center gap-2 py-3 font-mono text-[13px] uppercase tracking-[0.14em] text-fg transition-colors hover:text-chili"
            >
              <Phone className="h-4 w-4 text-chili" />
              {SITE.phone}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
