"use client";

import { useEffect, useState } from "react";
import { CHAPTERS, EXPERIENCE_VH } from "../config/site";

interface Props {
  onStation: (index: number) => void;
  activeIndex: number;
}

/**
 * The film's station docket: a slim, secondary station switcher shown ONLY
 * while the scroll film is running. It carries just the five journey stubs
 * (01 Steam .. 05 Table); the brand, page links, phone, theme toggle and the
 * Reserve action all live in the global <SiteNav/>, which is the single primary
 * header. This strip docks just beneath that header (top-16) and fades out once
 * the scroll passes the film into Act 2, so the two never read as stacked
 * headers.
 *
 * Docking is detected with a plain scroll listener so it also works under
 * prefers-reduced-motion, where the journey store never ticks. It floats on a
 * glass bar over the dark footage and follows the page theme, matching SiteNav.
 */
export default function TicketNav({ onStation, activeIndex }: Props) {
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const journeyEnd = ((EXPERIENCE_VH - 100) / 100) * window.innerHeight;
      setPast(window.scrollY > journeyEnd - 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={past ? "true" : undefined}
      className={`pointer-events-none fixed inset-x-0 top-16 z-40 hidden justify-center pt-3 transition-opacity duration-500 md:flex ${
        past ? "opacity-0" : "opacity-100"
      }`}
      style={{ pointerEvents: past ? "none" : undefined }}
    >
      <nav
        className={`glass flex items-center gap-1 px-2 py-1.5 ${past ? "" : "pointer-events-auto"}`}
        aria-label="Journey stations"
      >
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            tabIndex={past ? -1 : 0}
            onClick={() => onStation(i)}
            className={`group relative px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
              i === activeIndex ? "text-fg" : "text-fg-faint hover:text-fg-dim"
            }`}
            aria-current={i === activeIndex ? "true" : undefined}
          >
            {c.station}
            <span
              className={`absolute inset-x-3 bottom-0.5 h-px origin-left bg-chili transition-transform duration-300 ${
                i === activeIndex ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
}
