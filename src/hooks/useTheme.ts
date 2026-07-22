import { useCallback, useEffect, useState } from "react";

/**
 * Theme state for the night/daylight flip.
 * The source of truth is the data-theme attribute on <html>, set pre-paint by
 * the inline script in index.html. This hook mirrors it into React, persists
 * explicit choices to localStorage, follows the OS while no explicit choice
 * exists, and wraps the swap in a view transition for a soft cross-fade.
 */

export type Theme = "dark" | "light";

const STORAGE_KEY = "mustang-theme";

const THEME_COLOR: Record<Theme, string> = {
  dark: "#14181d",
  light: "#f4ede0",
};

function readTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  const meta = document.getElementById("meta-theme-color");
  if (meta) meta.setAttribute("content", THEME_COLOR[next]);
}

export function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>(() =>
    typeof document === "undefined" ? "dark" : readTheme(),
  );

  const toggle = useCallback(() => {
    const next: Theme = readTheme() === "light" ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: the choice just lives for this visit */
    }
    const commit = () => {
      applyTheme(next);
      setTheme(next);
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    /* Hidden documents abort view transitions with an InvalidStateError, so
       background toggles (cross-tab sync, automation) fall through to a
       plain commit. */
    if (!reduced && !document.hidden && typeof doc.startViewTransition === "function") {
      try {
        doc.startViewTransition(commit);
      } catch {
        commit();
      }
    } else {
      commit();
    }
  }, []);

  useEffect(() => {
    /* Another tab flipped the switch. */
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        applyTheme(e.newValue);
        setTheme(e.newValue);
      }
    };
    /* Follow the OS only while the visitor has not chosen explicitly. */
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onSystem = (e: MediaQueryListEvent) => {
      let stored: string | null = null;
      try {
        stored = localStorage.getItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (stored === "dark" || stored === "light") return;
      const next: Theme = e.matches ? "light" : "dark";
      applyTheme(next);
      setTheme(next);
    };
    window.addEventListener("storage", onStorage);
    mq.addEventListener("change", onSystem);
    return () => {
      window.removeEventListener("storage", onStorage);
      mq.removeEventListener("change", onSystem);
    };
  }, []);

  return { theme, toggle };
}
