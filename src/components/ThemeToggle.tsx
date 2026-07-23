"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/useTheme";

/**
 * Single night/daylight button. One square instrument key that swaps a sun for
 * a moon: the two icons are stacked and cross-faded with a short rotate, so the
 * button reads as the current sky rather than an iOS-style slider. All motion is
 * CSS only and collapses under prefers-reduced-motion.
 *
 * Two costumes, matching the nav: floating over the dark film it wears a cream
 * hairline (`docked` false) so it never reads as a pale box on the footage; once
 * the nav docks it adopts the page theme's line + surface.
 */
export default function ThemeToggle({ docked = true }: { docked?: boolean }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";

  return (
    // suppressHydrationWarning: theme comes from the inline script in index.html,
    // which stamps the real value onto <html> before hydration runs. useTheme's
    // initial state reads that real value immediately, so isLight can legitimately
    // differ from the server's always-"dark" render on the first client pass.
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to night mode" : "Switch to day mode"}
      aria-pressed={isLight}
      title={isLight ? "Night mode" : "Day mode"}
      suppressHydrationWarning
      className={`group relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden border transition-colors hover:border-chili focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chili ${
        docked ? "border-line bg-canvas-2/70 text-fg" : "border-cream/60 bg-black/25 text-cream"
      }`}
    >
      {/* Sun: shown in day mode. */}
      <Sun
        aria-hidden="true"
        suppressHydrationWarning
        className={`absolute h-4 w-4 text-chili transition-all duration-500 ease-[cubic-bezier(0.6,0.05,0.2,1)] motion-reduce:transition-none ${
          isLight ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"
        }`}
      />
      {/* Moon: shown in night mode. */}
      <Moon
        aria-hidden="true"
        suppressHydrationWarning
        className={`absolute h-4 w-4 transition-all duration-500 ease-[cubic-bezier(0.6,0.05,0.2,1)] motion-reduce:transition-none ${
          isLight ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"
        }`}
      />
    </button>
  );
}
