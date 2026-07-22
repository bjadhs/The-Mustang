import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { CHAPTERS, EXPERIENCE_VH, SITE } from "../config/site";
import ThemeToggle from "./ThemeToggle";

interface Props {
  onStation: (index: number) => void;
  activeIndex: number;
}

/**
 * Top navigation styled as a kitchen order docket: brand stamp on the left,
 * the five journey stations as ticket stubs, theme toggle and the reserve
 * line on the right.
 *
 * Two costumes: floating over the film it wears cream ink (theme-independent,
 * always legible on the dark footage); once the scroll passes the journey it
 * docks onto a glass bar and adopts the page theme. Docking is detected with a
 * plain scroll listener so it also works under prefers-reduced-motion, where
 * the journey store never ticks.
 */
export default function TicketNav({ onStation, activeIndex }: Props) {
  const [docked, setDocked] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const journeyEnd = ((EXPERIENCE_VH - 100) / 100) * window.innerHeight;
      setDocked(window.scrollY > journeyEnd - 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${docked ? "glass" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <a
          href="/"
          className={`font-display text-lg font-extrabold tracking-tight transition-colors duration-500 ${
            docked ? "text-fg" : "text-cream [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
          }`}
        >
          The&nbsp;Mustang
          <span
            className={`ml-2 hidden font-mono text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-500 sm:inline ${
              docked ? "text-fg-faint" : "text-cream/55"
            }`}
          >
            Farrer ACT
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Journey stations">
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onStation(i)}
              className={`group relative px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                i === activeIndex
                  ? docked
                    ? "text-fg"
                    : "text-cream [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
                  : docked
                    ? "text-fg-faint hover:text-fg-dim"
                    : "text-cream/55 hover:text-cream/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
              }`}
              aria-current={i === activeIndex ? "true" : undefined}
            >
              {c.station}
              <span
                className={`absolute inset-x-3 bottom-1 h-px origin-left bg-chili transition-transform duration-300 ${
                  i === activeIndex ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50"
                }`}
              />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle docked={docked} />
          <a
            href={SITE.phoneHref}
            className={`group flex items-center gap-2 border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:border-chili active:scale-[0.98] ${
              docked ? "border-line text-fg" : "border-cream/25 text-cream [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
            }`}
          >
            <Phone className="h-3.5 w-3.5 text-chili transition-transform group-hover:rotate-12" />
            <span className="hidden sm:inline">{SITE.phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>
      <div className="docket-rule mx-auto max-w-7xl px-5" />
    </header>
  );
}
