"use client";

/*
 * The interactive half of the /reserve page: a visual floor plan on the left
 * and a booking form on the right, sharing one piece of lifted state, the
 * selected table. Co-locating both in a single client boundary keeps the
 * selection wiring trivial (no context, no store) and lets the page stay a
 * server component with its own metadata.
 *
 * The form POSTs JSON to /api/reserve (kind: "reservation") and shows
 * submitting / success / error inline. A picked table is a SEATING PREFERENCE,
 * not a guaranteed hold; the copy says so, and same-day bookings are pushed to
 * the phone since nothing here confirms availability in real time.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CalendarCheck, CheckCircle2, Loader2, MapPin, Phone } from "lucide-react";
import { SITE } from "../config/site";
import { useNow } from "../lib/hooks/use-now";
import FloorPlan, { type TableSelection } from "./FloorPlan";

/* Dinner seatings every 30 minutes, 5:00pm to 9:30pm. */
const TIME_SLOTS: { value: string; label: string }[] = [
  { value: "17:00", label: "5:00 pm" },
  { value: "17:30", label: "5:30 pm" },
  { value: "18:00", label: "6:00 pm" },
  { value: "18:30", label: "6:30 pm" },
  { value: "19:00", label: "7:00 pm" },
  { value: "19:30", label: "7:30 pm" },
  { value: "20:00", label: "8:00 pm" },
  { value: "20:30", label: "8:30 pm" },
  { value: "21:00", label: "9:00 pm" },
  { value: "21:30", label: "9:30 pm" },
];

const PARTY_SIZES = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

interface Fields {
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  partySize: string;
  occasion: string;
}

const EMPTY: Fields = {
  name: "",
  phone: "",
  email: "",
  date: "",
  time: "",
  partySize: "2",
  occasion: "",
};

const FIELD =
  "w-full rounded-none border border-line bg-canvas px-3.5 py-2.5 font-body text-sm text-fg " +
  "placeholder:text-fg-faint transition-colors duration-200 outline-none focus:border-chili";
const LABEL = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-fg-faint";

type Status = "idle" | "submitting" | "success" | "error";

export default function ReserveForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [table, setTable] = useState<TableSelection | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string>("");
  const successName = useRef<string>("");

  // On small screens the floor plan and the form are two steps: the plan shows
  // first, then collapses to reveal the form the moment a table is picked (or
  // the guest chooses to skip). On large screens both panels are always visible
  // side by side, so this flag is ignored above the `lg` breakpoint.
  const [mobileView, setMobileView] = useState<"plan" | "form">("plan");

  const handleSelect = (t: TableSelection) => {
    setTable((cur) => (cur?.id === t.id ? null : t));
    setMobileView("form");
  };

  // Booking window: today through ~30 days out. Derived from a hydration-safe
  // clock (0 until mounted) so the date-input min/max are omitted on the server
  // and first client render, then filled in after hydration. Computing them
  // during render would bake the build date into the static HTML and mismatch.
  const now = useNow();
  const { today, maxDate } = useMemo<{ today?: string; maxDate?: string }>(() => {
    if (!now) return { today: undefined, maxDate: undefined };
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const later = new Date(now);
    later.setDate(later.getDate() + 30);
    return { today: iso(new Date(now)), maxDate: iso(later) };
  }, [now]);

  // Prefill from the AI concierge deep-link (/reserve?date=&time=&party=).
  // Read from window.location on mount rather than useSearchParams so /reserve
  // stays statically prerendered (no Suspense boundary required).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const date = q.get("date");
    const time = q.get("time");
    const party = q.get("party") ?? q.get("partySize");
    setFields((f) => {
      const next = { ...f };
      if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) next.date = date;
      if (time) {
        const slot = TIME_SLOTS.find((s) => s.value === time || s.label === time);
        if (slot) next.time = slot.value;
      }
      if (party) {
        const n = parseInt(party, 10);
        if (Number.isFinite(n) && n >= 1) next.partySize = n >= 10 ? "10+" : String(n);
      }
      return next;
    });
  }, []);

  const set =
    (key: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setError("");

    const selectedSlot = TIME_SLOTS.find((s) => s.value === fields.time);

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "reservation",
          name: fields.name,
          phone: fields.phone,
          email: fields.email,
          date: fields.date,
          time: selectedSlot?.label ?? fields.time,
          partySize: fields.partySize,
          occasion: fields.occasion,
          table,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        setError(data.message || "Something went wrong. Please try again or call us.");
        setStatus("error");
        return;
      }
      successName.current = fields.name.trim().split(/\s+/)[0] || "there";
      setStatus("success");
      setFields(EMPTY);
      setTable(null);
    } catch {
      setError("We could not reach the kitchen just now. Please try again or call us.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border border-line border-t-2 border-t-chili bg-canvas-2 p-6 md:p-8"
      >
        <CheckCircle2 className="h-8 w-8 text-chili" aria-hidden="true" />
        <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">
          Thanks, {successName.current}. Your request is in.
        </h2>
        <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-fg-dim">
          We have sent your table request to the restaurant and will confirm by phone. Remember, a
          chosen table is a seating preference, not a guaranteed hold.
        </p>
        <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-fg-dim">
          Booking for tonight? Please call us so we can seat you right away.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={SITE.phoneHref}
            className="inline-flex items-center gap-2 bg-chili px-5 py-3 font-display text-sm font-bold tracking-tight text-cream transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" /> {SITE.phone}
          </a>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="inline-flex items-center gap-2 border border-line px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim transition-colors hover:border-chili hover:text-fg"
          >
            Make another booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
      {/* Left: the room. Hidden on mobile once the form step is active; always
          shown on large screens. */}
      <div
        className={`flex-col gap-3 lg:flex lg:h-full ${
          mobileView === "form" ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="lg:min-h-0 lg:flex-1">
          <FloorPlan selectedId={table?.id ?? null} onSelect={handleSelect} />
        </div>
        <p className="flex shrink-0 items-start gap-2 text-xs leading-relaxed text-fg-faint">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-chili" aria-hidden="true" />
          Pick a table to note a seating preference. It is not a guaranteed hold; the team will do
          their best to seat you there.
        </p>
        {/* Mobile only: proceed to the form without picking a table. */}
        <button
          type="button"
          onClick={() => setMobileView("form")}
          className="flex shrink-0 items-center justify-center gap-2 border border-line px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim transition-colors hover:border-chili hover:text-fg lg:hidden"
        >
          Continue without a table
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Right: the booking form. Hidden on mobile until the plan step hands
          off; always shown on large screens. */}
      <form
        onSubmit={onSubmit}
        className={`border border-line border-t-2 border-t-chili bg-canvas-2 p-6 md:p-7 ${
          mobileView === "plan" ? "hidden lg:block" : "block"
        }`}
        aria-label="Reserve a table"
      >
        {/* Mobile only: step back to the floor plan to pick or change a table. */}
        <button
          type="button"
          onClick={() => setMobileView("plan")}
          className="mb-5 flex w-full items-center justify-between gap-3 border border-line px-3.5 py-2.5 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim transition-colors hover:border-chili lg:hidden"
        >
          <span className="truncate">
            {table ? `${table.label} · ${table.zone}` : "No table selected"}
          </span>
          <span className="shrink-0 text-chili">Change</span>
        </button>
        <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-chili">
          <CalendarCheck className="h-3.5 w-3.5" /> Book a table
        </p>
        <p className="mb-6 text-sm leading-relaxed text-fg-dim">
          Tell us when and how many. We will confirm your booking by phone.
        </p>

        {/* Selected table, read-only, filled from the floor plan. */}
        <div className="mb-4">
          <label htmlFor="rf-table" className={LABEL}>
            Selected table
          </label>
          <input
            id="rf-table"
            type="text"
            readOnly
            value={
              table
                ? `${table.label} · ${table.zone} · seats ${table.seats}`
                : "No preference (tap a table on the plan)"
            }
            aria-describedby="rf-table-note"
            className={`${FIELD} cursor-default ${table ? "text-fg" : "text-fg-faint"}`}
          />
          <p id="rf-table-note" className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
            Preference only, not a hold
          </p>
        </div>

        <div className="mb-4">
          <label htmlFor="rf-name" className={LABEL}>
            Name
          </label>
          <input
            id="rf-name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            value={fields.name}
            onChange={set("name")}
            className={FIELD}
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="rf-phone" className={LABEL}>
              Phone
            </label>
            <input
              id="rf-phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="04xx xxx xxx"
              value={fields.phone}
              onChange={set("phone")}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="rf-email" className={LABEL}>
              Email
            </label>
            <input
              id="rf-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@email.com"
              value={fields.email}
              onChange={set("email")}
              className={FIELD}
            />
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor="rf-date" className={LABEL}>
              Date
            </label>
            <input
              id="rf-date"
              type="date"
              required
              min={today}
              max={maxDate}
              value={fields.date}
              onChange={set("date")}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="rf-time" className={LABEL}>
              Time
            </label>
            <select id="rf-time" required value={fields.time} onChange={set("time")} className={FIELD}>
              <option value="" disabled>
                Select
              </option>
              {TIME_SLOTS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="rf-guests" className={LABEL}>
              Guests
            </label>
            <select
              id="rf-guests"
              required
              value={fields.partySize}
              onChange={set("partySize")}
              className={FIELD}
            >
              {PARTY_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="rf-occasion" className={LABEL}>
            Occasion or notes <span className="text-fg-faint">(optional)</span>
          </label>
          <textarea
            id="rf-occasion"
            rows={3}
            placeholder="Birthday, dietary needs, high chair, anything we should know"
            value={fields.occasion}
            onChange={set("occasion")}
            className={`${FIELD} resize-y`}
          />
        </div>

        {status === "error" && (
          <p
            role="alert"
            className="mb-4 border border-chili/40 bg-chili/10 px-3.5 py-2.5 text-sm leading-relaxed text-fg"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="cta-shimmer relative flex w-full items-center justify-center gap-2.5 overflow-hidden bg-chili px-6 py-4 font-display text-base font-bold tracking-tight text-cream transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:translate-y-0 disabled:opacity-80"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Sending your request
            </>
          ) : (
            <>
              Request a table
              <ArrowUpRight className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">
          Booking for today? Call{" "}
          <a href={SITE.phoneHref} className="text-fg-dim transition-colors hover:text-chili">
            {SITE.phone}
          </a>
        </p>
      </form>
    </div>
  );
}
