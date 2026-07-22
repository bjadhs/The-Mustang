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

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
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
