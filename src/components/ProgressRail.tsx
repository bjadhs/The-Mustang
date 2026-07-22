"use client";

import { useEffect, useRef } from "react";
import { CHAPTERS } from "../config/site";
import { journey } from "../lib/journeyStore";

interface Props {
  onStation: (index: number) => void;
}

const fmt = (t: number) => {
  const s = Math.max(0, t);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}.${String(Math.floor((s % 1) * 10))}`;
};

/**
 * Left-edge film instrument: timecode up top, the station gauge in the middle,
 * chapter fraction and a 24fps frame counter below. Everything is written
 * imperatively from the journey store so nothing re-renders per frame, and the
 * whole instrument bows out once the film hands over to Act 2.
 * Cream ink throughout: the HUD only ever sits over the dark footage, so it
 * must not flip with the page theme.
 */
export default function ProgressRail({ onStation }: Props) {
  const rootRef = useRef<HTMLElement | null>(null);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLSpanElement | null>(null);
  const metaRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    return journey.subscribe(({ progress, time, duration }) => {
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
      if (timeRef.current && duration > 0) {
        timeRef.current.textContent = `${fmt(time)} / ${fmt(duration)}`;
      }
      if (metaRef.current) {
        const idx = CHAPTERS.findIndex((c) => progress >= c.from && progress < c.to);
        const ch = idx === -1 ? CHAPTERS.length : idx + 1;
        const frame = Math.floor(time * 24);
        metaRef.current.textContent = `CH ${String(ch).padStart(2, "0")}/${String(CHAPTERS.length).padStart(2, "0")} F${String(frame).padStart(3, "0")}`;
      }
      if (rootRef.current) {
        const done = progress >= 0.999;
        rootRef.current.style.opacity = done ? "0" : "1";
        rootRef.current.style.pointerEvents = done ? "none" : "";
      }
    });
  }, []);

  return (
    <aside
      ref={rootRef}
      className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 transition-opacity duration-500 lg:flex"
      aria-hidden="true"
    >
      <span
        ref={timeRef}
        className="font-mono text-[10px] tracking-widest text-cream/60 [writing-mode:vertical-rl] [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]"
      >
        00:00.0 / 00:08.0
      </span>
      <div className="relative h-56 w-px bg-cream/15">
        <div
          ref={fillRef}
          className="absolute inset-x-0 top-0 h-full origin-top bg-chili"
          style={{ transform: "scaleY(0)" }}
        />
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            tabIndex={-1}
            onClick={() => onStation(i)}
            className="absolute -left-[3px] h-[7px] w-[7px] rotate-45 border border-cream/40 bg-[rgba(5,6,7,0.5)] transition-colors hover:border-chili hover:bg-chili"
            style={{ top: `${c.from * 100}%` }}
            aria-label={c.station}
          />
        ))}
      </div>
      <span
        ref={metaRef}
        className="font-mono text-[10px] tracking-[0.16em] text-cream/60 [writing-mode:vertical-rl] [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]"
      >
        CH 01/05 F000
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-cream/45 [writing-mode:vertical-rl] [text-shadow:0_1px_8px_rgba(0,0,0,0.7)]">
        The journey
      </span>
    </aside>
  );
}
