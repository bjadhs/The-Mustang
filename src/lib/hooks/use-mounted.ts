"use client";

import { useEffect, useState } from "react";

/**
 * Hydration-aware mount detection. Returns false during SSR and the first
 * client render (so server and client markup agree), then true after mount.
 *
 * Use it to gate anything whose value only exists in the browser (current
 * time, window size, localStorage-derived UI) so it never causes a hydration
 * mismatch. For a live-updating timestamp prefer `useNow`.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
