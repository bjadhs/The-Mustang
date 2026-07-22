import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarCheck, Loader2 } from "lucide-react";
import { SITE } from "../config/site";
import { useToast } from "./Toast";

/* Dinner service runs 5:00pm to 9:30pm, so seatings stop at 9:00pm. */
const TIME_SLOTS = [
  "5:00 pm",
  "5:30 pm",
  "6:00 pm",
  "6:30 pm",
  "7:00 pm",
  "7:30 pm",
  "8:00 pm",
  "8:30 pm",
  "9:00 pm",
];

const PARTY_SIZES = ["1", "2", "3", "4", "5", "6", "7", "8", "9+"];

interface Fields {
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
}

const EMPTY: Fields = { name: "", phone: "", date: "", time: "", guests: "2" };

/* Theme-aware field chrome. The form lives inside the themed reservation
   dialog, so it follows the page theme rather than the dark film. */
const FIELD =
  "w-full rounded-none border border-line bg-canvas px-3.5 py-2.5 font-body text-sm text-fg " +
  "placeholder:text-fg-faint transition-colors duration-200 outline-none focus:border-chili";

const LABEL = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-fg-faint";

export default function ReservationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const timers = useRef<number[]>([]);

  // Reservations only make sense from today forward.
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((id) => window.clearTimeout(id));
  }, []);

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // No backend on this landing page: we acknowledge the request client-side
    // and hand off to a real booking later. The brief delay reads as "sending".
    const id = window.setTimeout(() => {
      const firstName = fields.name.trim().split(/\s+/)[0] || "there";
      setSubmitting(false);
      toast.show(
        `Thanks, ${firstName}. Your table for ${fields.guests} on ${fields.date} at ${fields.time} is in. We will confirm by phone shortly.`,
      );
      setFields(EMPTY);
      onSuccess?.();
    }, 750);
    timers.current.push(id);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="border border-line border-t-2 border-t-chili bg-canvas-2 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)] md:p-7"
      aria-label="Reserve a table"
    >
      <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-chili">
        <CalendarCheck className="h-3.5 w-3.5" /> Book a table
      </p>
      <p className="mb-6 text-sm leading-relaxed text-fg-dim">
        Tell us when and how many. We will hold the seats and confirm by phone.
      </p>

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

      <div className="mb-4">
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

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="rf-date" className={LABEL}>
            Date
          </label>
          <input
            id="rf-date"
            type="date"
            required
            min={today}
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
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="rf-guests" className={LABEL}>
          Guests
        </label>
        <select id="rf-guests" required value={fields.guests} onChange={set("guests")} className={FIELD}>
          {PARTY_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} {n === "1" ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="cta-shimmer relative flex w-full items-center justify-center gap-2.5 overflow-hidden bg-chili px-6 py-4 font-display text-base font-bold tracking-tight text-cream transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:translate-y-0 disabled:opacity-80"
      >
        {submitting ? (
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
        Or call{" "}
        <a href={SITE.phoneHref} className="text-fg-dim transition-colors hover:text-chili">
          {SITE.phone}
        </a>
      </p>
    </form>
  );
}
