/**
 * Server-only mail helper. Wraps a nodemailer SMTP transport configured entirely
 * from environment variables so no credentials live in the repo. Imported only
 * by server route handlers (app/api/reserve/route.ts); never pull this into a
 * client component, it would leak the transport config into the bundle.
 *
 * Required env (see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional env:
 *   SMTP_SECURE ("true" for implicit TLS on 465, else STARTTLS on 587)
 *   SMTP_FROM (envelope + header From; falls back to SMTP_USER)
 *   RESERVATION_TO (destination inbox; the route defaults this to SITE.email)
 */

import nodemailer, { type Transporter } from "nodemailer";

export interface SendMailArgs {
  subject: string;
  text: string;
  html?: string;
  /** Guest's email, so a staff reply goes straight back to them. */
  replyTo?: string;
  /** Override the default destination (RESERVATION_TO). */
  to?: string;
}

/** Reads SMTP_* from the environment. Throws if the essentials are absent. */
function readConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  // SMTP_SECURE overrides; otherwise infer from the well-known implicit-TLS port.
  const secure =
    process.env.SMTP_SECURE != null
      ? process.env.SMTP_SECURE === "true"
      : port === 465;
  const from = process.env.SMTP_FROM || user;

  if (!host || !user || !pass || !from) {
    throw new Error("SMTP is not configured (missing SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM)");
  }
  return { host, port, user, pass, secure, from };
}

// Reuse one transport across warm invocations rather than reconnecting per send.
let cached: Transporter | null = null;

function getTransport(): { transport: Transporter; from: string } {
  const cfg = readConfig();
  if (!cached) {
    cached = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: { user: cfg.user, pass: cfg.pass },
    });
  }
  return { transport: cached, from: cfg.from };
}

/**
 * Sends one message to the restaurant inbox. Resolves with the provider message
 * id. Throws on any transport error; callers must catch and avoid surfacing the
 * raw error to clients.
 */
export async function sendMail({ subject, text, html, replyTo, to }: SendMailArgs): Promise<string> {
  const { transport, from } = getTransport();
  const destination = to || process.env.RESERVATION_TO;
  if (!destination) {
    throw new Error("No mail destination configured (RESERVATION_TO)");
  }

  const info = await transport.sendMail({
    from,
    to: destination,
    subject,
    text,
    ...(html ? { html } : {}),
    ...(replyTo ? { replyTo } : {}),
  });
  return info.messageId;
}
