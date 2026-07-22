"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * A hydration-safe current timestamp (ms). Backed by useSyncExternalStore so
 * the server snapshot is a stable 0 (SSR and the first client render agree),
 * and React swaps in the real client time after hydration without a mismatch
 * warning. Never call `Date.now()` / `new Date()` during render yourself; read
 * from this instead.
 *
 * Returns 0 until hydrated, so guard derived values: `now ? new Date(now) : ...`.
 *
 * The snapshot is cached in a ref and only advances on a real tick. Returning
 * `Date.now()` straight from getSnapshot would make useSyncExternalStore see a
 * new value on every render and loop forever ("Maximum update depth exceeded").
 *
 * @param interval optional ms tick; when set, the value updates on that
 * cadence (e.g. a live clock). Omit for a one-shot "now after hydration".
 */
export function useNow(interval?: number): number {
  const snapshot = useRef(0);

  const getSnapshot = useCallback(() => {
    // First client read latches the current time; stays stable afterwards so
    // the store looks unchanged between renders (and between real ticks).
    if (snapshot.current === 0) snapshot.current = Date.now();
    return snapshot.current;
  }, []);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!interval || interval <= 0) return () => {};
      const id = setInterval(() => {
        snapshot.current = Date.now();
        onChange();
      }, interval);
      return () => clearInterval(id);
    },
    [interval],
  );

  // Server snapshot is a stable 0 so SSR markup omits any derived value.
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}
