import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "../src/config/site";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="paper-texture flex min-h-dvh flex-col items-center justify-center bg-canvas px-5 py-32 text-fg">
      <div className="mx-auto w-full max-w-2xl">
        <p className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.24em]">
          <span className="text-fg-faint">404</span>
          <span className="text-chili">Off the menu</span>
        </p>

        <h1 className="mt-6 font-display text-6xl font-extrabold leading-[0.9] tracking-tighter md:text-8xl">
          This table
          <br />
          isn't set.
        </h1>

        <div className="docket-rule my-10 max-w-md" />

        <p className="max-w-[52ch] text-lg leading-relaxed text-fg-dim">
          The page you were after has moved on or never existed. The kitchen is
          still open though, so let us point you back to the good stuff.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/menu"
            className="cta-shimmer relative inline-flex items-center gap-3 overflow-hidden bg-chili px-7 py-4 font-display text-base font-bold tracking-tight text-cream transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            See the menu
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            href="/reserve"
            className="group inline-flex items-center gap-2 border border-line px-6 py-4 font-mono text-xs uppercase tracking-[0.16em] text-fg-dim transition-colors hover:border-chili hover:text-fg active:scale-[0.98]"
          >
            Reserve a table
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-faint">
          <Link href="/" className="transition-colors hover:text-fg">
            Back to home
          </Link>
          <span aria-hidden="true" className="text-chili/60">
            ·
          </span>
          <span>{SITE.brand}, {SITE.place}</span>
        </div>
      </div>
    </main>
  );
}
