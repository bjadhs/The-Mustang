"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Flame, Phone, Search, Utensils, X } from "lucide-react";
import {
  MENU_CATEGORY_META,
  menuByCategory,
  type Dietary,
  type MenuCategoryId,
  type MenuItem,
} from "../config/menu";
import { SITE } from "../config/site";

/* ---------------------------------------------------------------------------
 * Filter model. All filter state is derived from and written back to the URL
 * so any filtered view (e.g. /menu?diet=veg,gf&spice=1&q=momo) is shareable.
 * ------------------------------------------------------------------------- */

type DietKey = "veg" | "vegan" | "gf";

interface Filters {
  diet: DietKey[];
  /** Maximum spice level to show, 0..3. 3 shows everything. */
  maxSpice: number;
  /** Free text search over name + description. */
  q: string;
}

const DIET_TOGGLES: { key: DietKey; label: string }[] = [
  { key: "veg", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "gf", label: "Gluten free" },
];

const DIETARY_LABEL: Record<Dietary, string> = {
  V: "Veg",
  VG: "Vegan",
  GF: "GF",
  nuts: "Nuts",
};

function parseFilters(params: URLSearchParams): Filters {
  const dietRaw = (params.get("diet") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is DietKey => s === "veg" || s === "vegan" || s === "gf");
  const spiceRaw = Number(params.get("spice"));
  const maxSpice =
    Number.isFinite(spiceRaw) && spiceRaw >= 0 && spiceRaw <= 3 ? spiceRaw : 3;
  return {
    diet: Array.from(new Set(dietRaw)),
    maxSpice,
    q: params.get("q") ?? "",
  };
}

function serializeFilters(f: Filters): string {
  const params = new URLSearchParams();
  if (f.diet.length) params.set("diet", f.diet.join(","));
  if (f.maxSpice !== 3) params.set("spice", String(f.maxSpice));
  if (f.q.trim()) params.set("q", f.q.trim());
  const s = params.toString();
  return s ? `?${s}` : "";
}

function matchesFilters(item: MenuItem, f: Filters): boolean {
  // Vegan items count as vegetarian too.
  if (f.diet.includes("veg") && !(item.dietary.includes("V") || item.dietary.includes("VG"))) {
    return false;
  }
  if (f.diet.includes("vegan") && !item.dietary.includes("VG")) return false;
  if (f.diet.includes("gf") && !item.dietary.includes("GF")) return false;
  if (item.spice > f.maxSpice) return false;
  const q = f.q.trim().toLowerCase();
  if (q) {
    const hay = `${item.name} ${item.desc}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function filtersAreActive(f: Filters): boolean {
  return f.diet.length > 0 || f.maxSpice !== 3 || f.q.trim().length > 0;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/* ---------------------------------------------------------------------------
 * Small presentational pieces.
 * ------------------------------------------------------------------------- */

/* Spice as 0..3 chili flames. A screen-reader label carries the level. */
function SpiceLevel({ spice }: { spice: number }) {
  if (spice <= 0) {
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
        <Flame className="h-3 w-3" aria-hidden="true" />
        No heat
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-0.5" title={`Spice ${spice} of 3`}>
      <span className="sr-only">Spice level {spice} of 3</span>
      {[1, 2, 3].map((n) => (
        <Flame
          key={n}
          aria-hidden="true"
          className={
            n <= spice
              ? "h-3.5 w-3.5 fill-chili text-chili"
              : "h-3.5 w-3.5 text-fg-faint/40"
          }
        />
      ))}
    </span>
  );
}

function DietaryChips({ dietary }: { dietary: Dietary[] }) {
  if (!dietary.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5">
      {dietary.map((d) => (
        <span
          key={d}
          className="border border-line px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-fg-faint"
        >
          {d === "nuts" ? "Contains nuts" : DIETARY_LABEL[d]}
        </span>
      ))}
    </span>
  );
}

/* Menu photo with the styled-tile fallback when the png is not generated yet. */
function ItemImage({ item }: { item: MenuItem }) {
  const [failed, setFailed] = useState(!item.image);
  return (
    <div className="relative aspect-square w-20 shrink-0 overflow-hidden bg-canvas-3 sm:w-28 md:w-32">
      {!failed && item.image ? (
        <Image
          src={`/assets/food/${item.image}`}
          alt={item.name}
          fill
          sizes="(min-width: 768px) 128px, 96px"
          loading="lazy"
          onError={() => setFailed(true)}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(200,53,59,0.18),transparent_60%)]">
          <Utensils className="h-6 w-6 text-chili/60" />
        </div>
      )}
    </div>
  );
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <li className="flex gap-4 border-b border-line py-6 last:border-b-0 md:gap-6">
      <ItemImage item={item} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight md:text-2xl">
            {item.name}
          </h3>
          <span className="shrink-0 font-mono text-sm tabular-nums text-fg md:text-base">
            {item.price}
          </span>
        </div>
        <p className="mt-2 max-w-[62ch] text-sm leading-relaxed text-fg-dim">
          {item.desc}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <SpiceLevel spice={item.spice} />
          <DietaryChips dietary={item.dietary} />
        </div>
      </div>
    </li>
  );
}

/* ---------------------------------------------------------------------------
 * The interactive view.
 * ------------------------------------------------------------------------- */

function MenuViewInner() {
  const allSections = useMemo(() => menuByCategory(), []);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialise from the URL so a shared link (e.g. /menu?diet=veg) lands
  // pre-filtered. React state is the render source of truth for instant
  // filtering; a light effect mirrors it back into the URL for shareability.
  const [filters, setFilters] = useState<Filters>(() =>
    parseFilters(new URLSearchParams(searchParams.toString())),
  );

  useEffect(() => {
    const next = `/menu${serializeFilters(filters)}`;
    const current = `/menu${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
    // Only re-run when the derived query string changes, not on router identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Sections after filtering. Categories with no matches drop out entirely.
  const visibleSections = useMemo(
    () =>
      allSections
        .map(({ meta, items }) => ({
          meta,
          items: items.filter((it) => matchesFilters(it, filters)),
        }))
        .filter((s) => s.items.length > 0),
    [allSections, filters],
  );

  const visibleIds = visibleSections.map((s) => s.meta.id);
  const totalMatches = visibleSections.reduce((n, s) => n + s.items.length, 0);

  // Scroll-spy: the rail highlights (and jumps to) the section in view.
  const [activeId, setActiveId] = useState<MenuCategoryId | null>(
    visibleIds[0] ?? null,
  );
  const visibleSet = useRef<Set<string>>(new Set());

  useEffect(() => {
    const ids = visibleIds;
    if (!ids.length) {
      setActiveId(null);
      return;
    }
    // Keep the active id valid when filtering removes its section.
    setActiveId((prev) => (prev && ids.includes(prev) ? prev : ids[0]));

    const sectionEls = ids
      .map((id) => document.getElementById(`cat-${id}`))
      .filter((el): el is HTMLElement => el != null);

    visibleSet.current = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id.replace("cat-", "");
          if (entry.isIntersecting) visibleSet.current.add(id);
          else visibleSet.current.delete(id);
        }
        // Active = first section (in menu order) currently in view.
        const firstInView = ids.find((id) => visibleSet.current.has(id));
        if (firstInView) setActiveId(firstInView as MenuCategoryId);
      },
      // The trigger line sits just below the sticky nav + rail.
      { rootMargin: "-150px 0px -60% 0px", threshold: 0 },
    );
    sectionEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIds.join(",")]);

  // Keep the active rail chip scrolled into view horizontally.
  const railRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());
  useEffect(() => {
    if (!activeId) return;
    const rail = railRef.current;
    const chip = chipRefs.current.get(activeId);
    if (!rail || !chip) return;
    // Center the active chip by scrolling the rail HORIZONTALLY only. The old
    // chip.scrollIntoView({ block: "nearest" }) also scrolled the *window*
    // vertically to reveal the chip on first mount, which tucked the page
    // heading up under the sticky nav. Nudging rail.scrollLeft never touches the
    // page's vertical scroll, so the masthead stays put at load.
    const railRect = rail.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const delta =
      chipRect.left + chipRect.width / 2 - (railRect.left + railRect.width / 2);
    rail.scrollTo({
      left: rail.scrollLeft + delta,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [activeId]);

  const jumpTo = useCallback((id: MenuCategoryId) => {
    const el = document.getElementById(`cat-${id}`);
    if (el) {
      el.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }
  }, []);

  // Filter mutators.
  const toggleDiet = useCallback((key: DietKey) => {
    setFilters((f) => ({
      ...f,
      diet: f.diet.includes(key)
        ? f.diet.filter((d) => d !== key)
        : [...f.diet, key],
    }));
  }, []);
  const setMaxSpice = useCallback((n: number) => {
    setFilters((f) => ({ ...f, maxSpice: n }));
  }, []);
  const setQuery = useCallback((q: string) => {
    setFilters((f) => ({ ...f, q }));
  }, []);
  const clearFilters = useCallback(() => {
    setFilters({ diet: [], maxSpice: 3, q: "" });
  }, []);

  const active = filtersAreActive(filters);

  return (
    <div className="pb-24 md:pb-0">
      {/* -------- Filter toolbar -------- */}
      <section
        aria-label="Filter the menu"
        className="border-b border-line bg-canvas-2"
      >
        <div className="mx-auto max-w-6xl px-5 py-5 md:px-8 md:py-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-faint"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.q}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes, e.g. momo, paneer, lamb"
              aria-label="Search the menu"
              className="w-full border border-line bg-canvas py-2.5 pl-10 pr-3 font-mono text-sm text-fg placeholder:text-fg-faint focus:border-chili focus:outline-none focus:ring-1 focus:ring-chili"
            />
          </div>

          {/* Diet + spice controls */}
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div
              role="group"
              aria-label="Dietary filters"
              className="flex flex-wrap items-center gap-2"
            >
              {DIET_TOGGLES.map((t) => {
                const on = filters.diet.includes(t.key);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => toggleDiet(t.key)}
                    aria-pressed={on}
                    className={`border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                      on
                        ? "border-chili bg-chili text-cream"
                        : "border-line text-fg-dim hover:border-chili hover:text-fg"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Max spice */}
            <div
              role="group"
              aria-label="Maximum spice level"
              className="flex items-center gap-2"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-faint">
                Max spice
              </span>
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3].map((n) => {
                  const on = filters.maxSpice === n;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setMaxSpice(n)}
                      aria-pressed={on}
                      aria-label={
                        n === 0 ? "No heat only" : `Up to spice level ${n} of 3`
                      }
                      className={`flex h-8 min-w-8 items-center justify-center gap-0.5 border px-2 font-mono text-[11px] transition-colors ${
                        on
                          ? "border-chili bg-chili text-cream"
                          : "border-line text-fg-dim hover:border-chili hover:text-fg"
                      }`}
                    >
                      {n === 0 ? (
                        <span className="uppercase tracking-[0.12em]">0</span>
                      ) : (
                        Array.from({ length: n }).map((_, i) => (
                          <Flame
                            key={i}
                            className="h-3 w-3"
                            aria-hidden="true"
                            fill={on ? "currentColor" : "none"}
                          />
                        ))
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {active ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint transition-colors hover:text-chili"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Clear
              </button>
            ) : null}
          </div>

          <p
            className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-faint"
            aria-live="polite"
          >
            {totalMatches} {totalMatches === 1 ? "dish" : "dishes"}
            {active ? " match your filters" : " on the menu"}
          </p>
        </div>
      </section>

      {/* -------- Sticky category rail -------- */}
      <nav
        aria-label="Menu categories"
        className="glass sticky top-16 z-30 border-b border-line"
      >
        <div
          ref={railRef}
          className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-2.5 md:px-8"
          style={{ scrollbarWidth: "none" }}
        >
          {MENU_CATEGORY_META.map((meta) => {
            const enabled = visibleIds.includes(meta.id);
            const isActive = activeId === meta.id;
            return (
              <a
                key={meta.id}
                ref={(el) => {
                  if (el) chipRefs.current.set(meta.id, el);
                  else chipRefs.current.delete(meta.id);
                }}
                href={`#cat-${meta.id}`}
                onClick={(e) => {
                  if (!enabled) {
                    e.preventDefault();
                    return;
                  }
                  e.preventDefault();
                  jumpTo(meta.id);
                }}
                aria-current={isActive ? "true" : undefined}
                aria-disabled={enabled ? undefined : true}
                tabIndex={enabled ? undefined : -1}
                className={`shrink-0 whitespace-nowrap border px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors ${
                  !enabled
                    ? "pointer-events-none border-transparent text-fg-faint/40"
                    : isActive
                      ? "border-chili bg-chili text-cream"
                      : "border-line text-fg-dim hover:border-chili hover:text-fg"
                }`}
              >
                {meta.name}
              </a>
            );
          })}
        </div>
      </nav>

      {/* -------- Sections -------- */}
      {visibleSections.length ? (
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          {visibleSections.map(({ meta, items }) => (
            <section
              key={meta.id}
              id={`cat-${meta.id}`}
              aria-labelledby={`cat-${meta.id}-h`}
              className="scroll-mt-36 border-b border-line py-12 last:border-b-0 md:py-16"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2
                  id={`cat-${meta.id}-h`}
                  className="font-display text-3xl font-extrabold tracking-tighter md:text-5xl"
                >
                  {meta.name}
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-chili">
                  {meta.note}
                </span>
              </div>
              <div className="docket-rule mt-5" />
              <ul className="mt-2">
                {items.map((item) => (
                  <MenuRow key={item.name} item={item} />
                ))}
              </ul>

              {/* Quiet reserve link closing every section. */}
              <div className="mt-8">
                <Link
                  href="/reserve"
                  className="group inline-flex items-center gap-2 border-b border-line pb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-fg-dim transition-colors hover:border-chili hover:text-fg"
                >
                  Reserve a table for {meta.name}
                  <span className="text-chili transition-transform group-hover:translate-x-0.5">
                    &rsaquo;
                  </span>
                </Link>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-5 py-24 text-center md:px-8">
          <Utensils className="mx-auto h-8 w-8 text-chili/60" aria-hidden="true" />
          <p className="mt-5 font-display text-2xl font-bold tracking-tight">
            Nothing matches those filters
          </p>
          <p className="mx-auto mt-3 max-w-[42ch] text-sm leading-relaxed text-fg-dim">
            Try loosening the spice level or clearing a dietary filter. The whole
            menu is here waiting.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="cta-shimmer relative mt-7 inline-flex items-center overflow-hidden bg-chili px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* -------- Mobile sticky action bar -------- */}
      <div className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <a
            href={SITE.phoneHref}
            className="flex flex-1 items-center justify-center gap-2 border border-line py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-fg transition-colors hover:border-chili active:scale-[0.98]"
          >
            <Phone className="h-3.5 w-3.5 text-chili" aria-hidden="true" />
            Call
          </a>
          <Link
            href="/reserve"
            className="cta-shimmer relative flex flex-[1.4] items-center justify-center overflow-hidden bg-chili py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-cream transition-colors hover:bg-chili-deep active:scale-[0.98]"
          >
            Reserve a table
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MenuView() {
  // useSearchParams-free: we read window.location directly, but keep a Suspense
  // boundary so the client boundary never blocks static rendering of the page.
  return (
    <Suspense fallback={null}>
      <MenuViewInner />
    </Suspense>
  );
}
