/**
 * POST /api/reserve
 *
 * One endpoint, two kinds of message, discriminated by `kind`:
 *   - "reservation"      (default) the /reserve booking form
 *   - "catering-enquiry" the /catering enquiry form
 *
 * Both compose a readable staff email and hand it to the SMTP mailer. The
 * response is deliberately thin: { ok: true } on success, or a 400/500 with a
 * safe message. SMTP errors are logged server-side but never returned verbatim.
 *
 * nodemailer needs Node APIs, so this route opts out of the edge runtime.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "../../../src/lib/mailer";
import { SITE } from "../../../src/config/site";

export const runtime = "nodejs";

/* ---------------- Validation ---------------- */

const nonEmpty = (max: number) => z.string().trim().min(1).max(max);

// A guest's table preference lifted from the floor plan (all optional-ish; a
// booking can be made without picking a table).
const tablePreference = z
  .object({
    id: z.string().max(24),
    label: z.string().max(24),
    seats: z.number().int().min(1).max(20),
    zone: z.string().max(24),
  })
  .nullish();

const reservationSchema = z.object({
  kind: z.literal("reservation").default("reservation"),
  name: nonEmpty(120),
  phone: nonEmpty(40),
  email: z.string().trim().email().max(160),
  date: nonEmpty(20), // ISO yyyy-mm-dd from the native date input
  time: nonEmpty(20),
  partySize: nonEmpty(8),
  occasion: z.string().trim().max(600).optional().default(""),
  table: tablePreference,
});

const cateringSchema = z.object({
  kind: z.literal("catering-enquiry"),
  name: nonEmpty(120),
  phone: nonEmpty(40),
  email: z.string().trim().email().max(160),
  eventDate: nonEmpty(20),
  headcount: nonEmpty(8),
  occasion: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().max(2000).optional().default(""),
});

const bodySchema = z.discriminatedUnion("kind", [reservationSchema, cateringSchema]);

/* ---------------- Email composition ---------------- */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rowsToHtml(rows: [string, string][]): string {
  const trs = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#8b929c;font:12px/1.5 monospace;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;white-space:nowrap">${escapeHtml(
          k,
        )}</td><td style="padding:6px 0;color:#14181d;font:15px/1.5 sans-serif">${escapeHtml(
          v,
        ).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<div style="background:#f4ede0;padding:24px"><table style="border-collapse:collapse">${trs}</table></div>`;
}

function buildReservation(d: z.infer<typeof reservationSchema>) {
  const tableLine = d.table
    ? `${d.table.label} (${d.table.zone}, seats ${d.table.seats}) [preference, not a hold]`
    : "No preference";
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Phone", d.phone],
    ["Email", d.email],
    ["Date", d.date],
    ["Time", d.time],
    ["Party size", d.partySize],
    ["Table", tableLine],
  ];
  if (d.occasion) rows.push(["Occasion / notes", d.occasion]);

  const subject = `Reservation request: ${d.name}, party of ${d.partySize}, ${d.date} ${d.time}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  return { subject, text, html: rowsToHtml(rows) };
}

function buildCatering(d: z.infer<typeof cateringSchema>) {
  const rows: [string, string][] = [
    ["Name", d.name],
    ["Phone", d.phone],
    ["Email", d.email],
    ["Event date", d.eventDate],
    ["Headcount", d.headcount],
  ];
  if (d.occasion) rows.push(["Occasion", d.occasion]);
  if (d.message) rows.push(["Message", d.message]);

  const subject = `Catering enquiry: ${d.name}, ${d.headcount} guests, ${d.eventDate}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  return { subject, text, html: rowsToHtml(rows) };
}

/* ---------------- Handler ---------------- */

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const composed =
    data.kind === "catering-enquiry" ? buildCatering(data) : buildReservation(data);

  try {
    await sendMail({
      subject: composed.subject,
      text: composed.text,
      html: composed.html,
      replyTo: data.email,
      to: process.env.RESERVATION_TO || SITE.email,
    });
  } catch (err) {
    // Log the real error server-side; never leak SMTP internals to the client.
    console.error("[api/reserve] mail send failed:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not send your request just now. Please call us and we will sort it out.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
