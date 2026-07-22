import { useTheme } from "../hooks/useTheme";

/**
 * Night/daylight switch styled like the site's station instruments: a slim
 * ticket-stub track and a rotated diamond knob (the same 45 degree tick used
 * on the progress rail). At night the knob is a breathing chili ember; by day
 * it turns to lokta paper with a chili ring. All motion is CSS only.
 *
 * Two costumes, matching the nav: floating over the dark film it wears a cream
 * track (`docked` false) so it never reads as a pale box on the footage; once
 * the nav docks it adopts the page theme's line + surface.
 */
export default function ThemeToggle({ docked = true }: { docked?: boolean }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";
  const trackTick = docked ? "bg-line" : "bg-cream/40";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to night mode" : "Switch to day mode"}
      aria-pressed={isLight}
      title={isLight ? "Night mode" : "Day mode"}
      className={`group relative flex h-7 w-14 shrink-0 items-center rounded-full border px-[6px] transition-colors duration-500 hover:border-chili focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chili ${
        docked ? "border-fg-faint bg-canvas-2/70" : "border-cream/60 bg-black/25"
      }`}
    >
      {/* Track marks: tiny end ticks so it reads as an instrument, not an iOS switch. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-[7px] top-1/2 h-px w-1.5 -translate-y-1/2 ${trackTick}`}
      />
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute right-[7px] top-1/2 h-px w-1.5 -translate-y-1/2 ${trackTick}`}
      />
      <span
        aria-hidden="true"
        className={`tt-knob block h-[13px] w-[13px] rotate-45 transition-transform duration-500 ease-[cubic-bezier(0.6,0.05,0.2,1)] motion-reduce:transition-none ${
          isLight ? "translate-x-[30px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}
