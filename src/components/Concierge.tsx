"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { MessageCircle, X, Send, ArrowUpRight, Loader2 } from "lucide-react";
import { SITE } from "@/config/site";

/*
 * The Mustang AI concierge.
 *
 * A floating chili button (bottom right) opens a compact docket-styled chat
 * panel backed by /api/chat (Vercel AI SDK, useChat). The assistant answers
 * questions about The Mustang and can deep-link the guest into the reservation
 * form via the startReservation tool.
 *
 * Mounted once by the integrator in app/layout.tsx. Do not mount it here.
 *
 * Motion: honours prefers-reduced-motion, the panel simply shows/hides with no
 * slide or scale transition under reduced motion. Fully keyboard accessible,
 * ESC closes the panel.
 */

const STARTERS = [
  "What are your vegan options?",
  "Where are you?",
  "Book a table for 2",
] as const;

/** Narrow shape of the startReservation tool output we render. */
interface ReservationOutput {
  href: string;
  date: string | null;
  time: string | null;
  partySize: number | null;
}

function isReservationOutput(value: unknown): value is ReservationOutput {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { href?: unknown }).href === "string"
  );
}

export default function Concierge() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [reduced, setReduced] = useState(false);

  const { messages, sendMessage, status, error } = useChat();
  const busy = status === "submitted" || status === "streaming";

  const panelRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // ESC closes; focus the input when the panel opens.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [open]);

  // Keep the transcript pinned to the latest message.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <>
      {/* Launcher */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close the Mustang concierge" : "Ask the Mustang concierge"}
        className={`fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-chili text-cream shadow-xl shadow-black/30 outline-none transition-transform duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-cream/70 active:scale-95 motion-reduce:transition-none ${
          open ? "scale-0 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Mustang concierge"
          className={`glass fixed bottom-6 right-6 z-[95] flex max-h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-line bg-canvas-2/95 text-fg shadow-2xl shadow-black/40 backdrop-blur-xl ${
            reduced
              ? ""
              : "origin-bottom-right animate-[concierge-in_240ms_ease-out]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-chili opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-chili" />
              </span>
              <div className="leading-tight">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-fg">
                  Mustang concierge
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-fg-faint">
                  {SITE.place}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Close concierge"
              className="flex h-8 w-8 items-center justify-center rounded-full text-fg-dim outline-none transition-colors hover:bg-canvas-3 hover:text-fg focus-visible:ring-2 focus-visible:ring-chili"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Transcript */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
            aria-live="polite"
            aria-atomic="false"
          >
            {messages.length === 0 && (
              <div className="space-y-1">
                <p className="text-sm leading-relaxed text-fg-dim">
                  Namaste. I am the Mustang concierge. Ask me about our menu,
                  hours, dietary options or catering, or let me open a table
                  booking for you.
                </p>
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={message.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] space-y-2 ${
                      isUser
                        ? "rounded-2xl rounded-br-sm bg-chili px-3.5 py-2.5 text-sm leading-relaxed text-cream"
                        : "text-sm leading-relaxed text-fg"
                    }`}
                  >
                    {message.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <p key={i} className="whitespace-pre-wrap">
                            {part.text}
                          </p>
                        );
                      }

                      if (part.type === "tool-startReservation") {
                        if (
                          part.state === "output-available" &&
                          isReservationOutput(part.output)
                        ) {
                          const out = part.output;
                          return (
                            <Link
                              key={i}
                              href={out.href}
                              onClick={() => setOpen(false)}
                              className="cta-shimmer relative inline-flex items-center gap-2 overflow-hidden rounded-lg bg-chili px-3.5 py-2 font-display text-sm font-bold text-cream transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                              Open reservation form
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          );
                        }
                        return (
                          <p
                            key={i}
                            className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-faint"
                          >
                            Opening the reservation form...
                          </p>
                        );
                      }

                      if (part.type === "tool-getMenu") {
                        if (part.state !== "output-available") {
                          return (
                            <p
                              key={i}
                              className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-faint"
                            >
                              Checking the menu...
                            </p>
                          );
                        }
                        return null;
                      }

                      return null;
                    })}
                  </div>
                </div>
              );
            })}

            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 text-fg-faint">
                  <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em]">
                    Thinking
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm leading-relaxed text-chili">
                Sorry, something went wrong. Please try again, or call us on{" "}
                <a href={SITE.phoneHref} className="underline">
                  {SITE.phone}
                </a>
                .
              </p>
            )}
          </div>

          {/* Starter chips */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {STARTERS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => submit(chip)}
                  className="rounded-full border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-dim outline-none transition-colors hover:border-chili hover:text-fg focus-visible:ring-2 focus-visible:ring-chili"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 border-t border-line px-3 py-3"
          >
            <label htmlFor="concierge-input" className="sr-only">
              Ask the Mustang concierge
            </label>
            <input
              id="concierge-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the menu, hours, a table..."
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chili text-cream outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-chili active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 motion-reduce:transition-none"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Panel entrance keyframes (motion-safe only; reduced motion skips them). */}
      <style>{`
        @keyframes concierge-in {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}
