import { useEffect, useRef, useState } from "react";
import { POSTER_SOURCES, VIDEO_SOURCES } from "../config/site";
import { journey } from "../lib/journeyStore";

/**
 * The fixed, full-screen native video behind the interface.
 * Scroll position drives currentTime: the visitor plays the film by scrolling.
 *
 * - Sources are tried in order (local file first, hosted render second).
 * - Each source is fetched to a Blob URL when possible so seeking stays
 *   frame-accurate; if fetching is blocked (offline, CORS) the element falls
 *   back to streaming the URL directly.
 * - The film's real duration is read from loadedmetadata, never hardcoded.
 * - prefers-reduced-motion: the poster still is shown and no video is fetched.
 */
interface Props {
  /** The journey act element. Scroll progress is measured across it only, so
   *  content sections below it flow on a solid background. */
  rangeRef?: React.RefObject<HTMLElement | null>;
}

export default function VideoStage({ rangeRef }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const video = videoRef.current;
    if (!video) return;

    let blobUrl: string | null = null;
    let raf = 0;
    let cancelled = false;
    const abort = new AbortController();

    const attachSource = async () => {
      for (const src of VIDEO_SOURCES) {
        try {
          const res = await fetch(src, { signal: abort.signal });
          if (!res.ok) continue;
          // A dev server's SPA fallback answers a missing /assets/*.mp4 with
          // index.html (200). Reject anything that is not actually video so we
          // fall through to the hosted stream instead of blobbing markup.
          const type = res.headers.get("content-type") || "";
          if (type && !/(video|mp4|octet-stream)/i.test(type)) continue;
          const blob = await res.blob();
          if (blob.type && !/(video|mp4|octet-stream)/i.test(blob.type)) continue;
          if (cancelled) return;
          blobUrl = URL.createObjectURL(blob);
          video.src = blobUrl;
          video.load();
          return;
        } catch {
          if (cancelled) return;
          // fetch blocked or failed: keep trying the next source
        }
      }
      // Last resort: stream the hosted file directly (cross-origin, seekable).
      if (!cancelled) {
        video.src = VIDEO_SOURCES[VIDEO_SOURCES.length - 1];
        video.load();
      }
    };

    const onMeta = () => {
      journey.set({ duration: video.duration || 0 });
      setReady(true);
    };
    const onLoadedData = () => setReady(true);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("canplay", onLoadedData);

    // iOS decoders want one user-gesture play before currentTime scrubbing.
    const prime = () => {
      const p = video.play();
      if (p) p.then(() => video.pause()).catch(() => undefined);
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("pointerdown", prime);
    };
    window.addEventListener("touchstart", prime, { passive: true });
    window.addEventListener("pointerdown", prime, { passive: true });

    const loop = () => {
      raf = requestAnimationFrame(loop);

      // Progress is measured across the journey act only, not the whole page.
      let progress: number;
      const rangeEl = rangeRef?.current;
      if (rangeEl) {
        const absTop = rangeEl.getBoundingClientRect().top + window.scrollY;
        const span = rangeEl.offsetHeight - window.innerHeight;
        progress = span > 0 ? Math.min(1, Math.max(0, (window.scrollY - absTop) / span)) : 0;
      } else {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      }
      const duration = video.duration;

      if (Number.isFinite(duration) && duration > 0 && video.readyState >= 1) {
        const target = progress * (duration - 0.05);
        const current = video.currentTime;
        const delta = target - current;
        if (Math.abs(delta) > 0.01 && !video.seeking) {
          // Ease toward the target so fast flicks feel filmic, not chattery.
          video.currentTime = Math.abs(delta) > 1.5 ? target : current + delta * 0.38;
        }
        journey.set({ progress, time: video.currentTime, duration });
      } else {
        journey.set({ progress });
      }
    };
    raf = requestAnimationFrame(loop);

    void attachSource();

    return () => {
      cancelled = true;
      abort.abort();
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("canplay", onLoadedData);
      window.removeEventListener("touchstart", prime);
      window.removeEventListener("pointerdown", prime);
      video.removeAttribute("src");
      video.load();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [reduced, rangeRef]);

  return (
    <div className="fixed inset-0 z-0 bg-[#050607]" aria-hidden="true">
      {/* Poster paints first and stays underneath until the film is decodable. */}
      <img
        src={POSTER_SOURCES[1]}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {!reduced && (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none"
          style={{ opacity: ready ? 1 : 0, transform: ready ? "scale(1)" : "scale(1.04)" }}
          tabIndex={-1}
        />
      )}
      {/* Legibility scrims: constant edge vignette, stronger at top and bottom.
          Hardcoded filmic ink in BOTH themes: the footage is the constant. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_38%,rgba(8,10,13,0.55)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[rgba(8,10,13,0.78)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[rgba(8,10,13,0.82)] to-transparent" />
    </div>
  );
}
