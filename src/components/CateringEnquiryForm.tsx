"use client";

import { useState } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Utensils } from "lucide-react";
import { SITE } from "../config/site";

/**
 * Catering enquiry form. POSTs JSON to /api/reserve (built by the reserve agent)
 * with kind: "catering-enquiry" and the shape below. This is explicitly an
 * ENQUIRY, not a confirmed booking: the copy and the success state both say so,
 * and the kitchen follows up to build a quote.
 *
 * Fields: name, phone, email, eventDate, headcount, message.
 * States: idle, submitting, success, error.
 */

interface Fields {
  name: string;
  phone: string;
  email: string;
  eventDate: string;
  headcount: string;
  message: string;
}

const EMPTY: Fields = {
  name: "",
  phone: "",
  email: "",
  eventDate: "",
  headcount: "",
  message: "",
};

type Status = "idle" | "submitting" | "success" | "error";

const FIELD =
  "w-full rounded-none border border-line bg-canvas px-3.5 py-2.5 font-body text-sm text-fg " +
  "placeholder:text-fg-faint transition-colors duration-200 outline-none focus:border-chili";

const LABEL = "mb-1.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-fg-faint";

export default function CateringEnquiryForm() {
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [status, setStatus] = useState<Status>("idle");

  // Enquiries only make sense for a date from today forward.
  const today = new Date().toISOString().slice(0, 10);

  const set =
    (key: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "catering-enquiry",
          name: fields.name,
          phone: fields.phone,
          email: fields.email,
          eventDate: fields.eventDate,
          headcount: fields.headcount,
          message: fields.message,
        }),
      });

      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus("success");
      setFields(EMPTY);
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    const firstName = "there";
    return (
      <div
        className="border border-line border-t-2 border-t-chili bg-canvas-2 p-8 md:p-10"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2 className="h-8 w-8 text-chili" aria-hidden="true" />
        <p className="mt-5 font-display text-2xl font-bold tracking-tight text-fg">
          Enquiry received. Thanks, {firstName}.
        </p>
        <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-fg-dim">
          This is an enquiry, not a confirmed booking. Our team will be in touch
          to talk through your menu, numbers and the details, then send a quote
          to lock it in.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim underline decoration-line underline-offset-4 transition-colors hover:text-chili"
          >
            Send another enquiry
          </button>
          <a
            href={SITE.phoneHref}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim transition-colors hover:text-chili"
          >
            Or call {SITE.phone}
          </a>
        </div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={onSubmit}
      className="border border-line border-t-2 border-t-chili bg-canvas-2 p-6 md:p-8"
      aria-label="Catering enquiry"
    >
      <p className="mb-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-chili">
        <Utensils className="h-3.5 w-3.5" /> Catering enquiry
      </p>
      <p className="mb-6 max-w-[48ch] text-sm leading-relaxed text-fg-dim">
        Tell us about your event and we will build a menu around it. This is an
        enquiry only, not a confirmed booking. We reply to talk through the
        details and send a quote.
      </p>

      <div className="mb-4">
        <label htmlFor="ce-name" className={LABEL}>
          Name
        </label>
        <input
          id="ce-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Your name"
          value={fields.name}
          onChange={set("name")}
          className={FIELD}
        />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ce-phone" className={LABEL}>
            Phone
          </label>
          <input
            id="ce-phone"
            name="phone"
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
          <label htmlFor="ce-email" className={LABEL}>
            Email
          </label>
          <input
            id="ce-email"
            name="email"
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

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ce-date" className={LABEL}>
            Event date
          </label>
          <input
            id="ce-date"
            name="eventDate"
            type="date"
            required
            min={today}
            value={fields.eventDate}
            onChange={set("eventDate")}
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="ce-headcount" className={LABEL}>
            Headcount
          </label>
          <input
            id="ce-headcount"
            name="headcount"
            type="number"
            inputMode="numeric"
            min={1}
            required
            placeholder="e.g. 40"
            value={fields.headcount}
            onChange={set("headcount")}
            className={FIELD}
          />
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="ce-message" className={LABEL}>
          Tell us about your event
        </label>
        <textarea
          id="ce-message"
          name="message"
          rows={4}
          required
          placeholder="Occasion, venue, any dietary needs, and whether you would like it on site or off site."
          value={fields.message}
          onChange={set("message")}
          className={`${FIELD} resize-y`}
        />
      </div>

      {status === "error" ? (
        <p
          className="mb-4 border border-chili/40 bg-chili/5 px-3.5 py-2.5 text-sm text-fg-dim"
          role="alert"
        >
          Something went wrong sending your enquiry. Please try again, or call{" "}
          <a href={SITE.phoneHref} className="text-chili hover:underline">
            {SITE.phone}
          </a>
          .
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="cta-shimmer relative flex w-full items-center justify-center gap-2.5 overflow-hidden bg-chili px-6 py-4 font-display text-base font-bold tracking-tight text-cream transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98] disabled:translate-y-0 disabled:opacity-80"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Sending your enquiry
          </>
        ) : (
          <>
            Send catering enquiry
            <ArrowUpRight className="h-4 w-4" />
          </>
        )}
      </button>

      <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">
        Prefer to talk it through? Call{" "}
        <a href={SITE.phoneHref} className="text-fg-dim transition-colors hover:text-chili">
          {SITE.phone}
        </a>
      </p>
    </form>
  );
}
