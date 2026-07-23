import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Boots Lenis smooth scrolling and bridges it into GSAP's ticker so
 * ScrollTrigger scrubs stay in lockstep. Returns the Lenis instance ref
 * so navigation can scrollTo stations.
 */
export function useLenis() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // lerp bumped 0.1 -> 0.12 so the scroll catches up a touch faster (less
    // "wading"), while wheel/touch multipliers cover a little more distance per
    // gesture. Net effect: the film scrubs in noticeably quicker but still
    // smooth. Keep these gentle; large values make the scrub feel twitchy.
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      wheelMultiplier: 1.18,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;
    /* Exposed so overlays (the reservation dialog) can pause/resume the smooth
       scroll while they hold the viewport. */
    (window as unknown as { __mustangLenis?: Lenis }).__mustangLenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      delete (window as unknown as { __mustangLenis?: Lenis }).__mustangLenis;
    };
  }, []);

  return lenisRef;
}
