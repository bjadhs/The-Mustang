"use client";

/*
 * A stylized top-down plan of the room, drawn from FLOOR_PLAN / FLOOR_GRID so
 * the layout is data, not artwork. Blueprint / kitchen-docket aesthetic: a
 * faint grid, mono labels, a single chili accent. Tables are selectable; every
 * table is keyboard reachable (Tab to it, Enter or Space to pick). Fixtures are
 * inert context.
 *
 * Table choice is a SEATING PREFERENCE only (v1 has no availability engine), so
 * nothing here is ever marked unavailable; the `unavailable` visual state is
 * built but unused until a real booking system fills it in.
 */

import { useId } from "react";
import {
  FIXTURES,
  FLOOR_GRID,
  TABLES,
  type FixtureElement,
  type TableElement,
} from "../config/floorPlan";

export interface TableSelection {
  id: string;
  label: string;
  seats: number;
  zone: TableElement["zone"];
}

interface FloorPlanProps {
  selectedId: string | null;
  onSelect: (table: TableSelection) => void;
  /** Optional set of table ids that cannot be booked. Unused in v1. */
  unavailableIds?: ReadonlySet<string>;
}

const ZONE_LABEL: Record<TableElement["zone"], string> = {
  window: "window",
  main: "main floor",
  booth: "booth",
};

/* Round/square/booth tables render their own body shape inside the box. */
function TableBody({
  table,
  state,
}: {
  table: TableElement;
  state: "available" | "selected" | "unavailable";
}) {
  const { x, y, w, h, shape } = table;
  const cx = x + w / 2;
  const cy = y + h / 2;

  const fill = state === "selected" ? "var(--m-chili)" : "transparent";
  const stroke = state === "selected" ? "var(--m-chili)" : "var(--m-fg-faint)";
  const strokeOpacity = state === "unavailable" ? 0.4 : 1;
  const dash = state === "unavailable" ? "2 2" : undefined;

  const common = {
    className: "fp-body",
    fill,
    stroke,
    strokeWidth: 0.8,
    strokeOpacity,
    strokeDasharray: dash,
    vectorEffect: "non-scaling-stroke" as const,
  };

  if (shape === "round") {
    return <circle cx={cx} cy={cy} r={Math.min(w, h) / 2} {...common} />;
  }
  if (shape === "booth") {
    // A banquette: a filled bench bar on the wall side plus the table box.
    return (
      <>
        <rect x={x} y={y} width={w} height={h} rx={1.5} {...common} />
        <rect
          x={x}
          y={y}
          width={3}
          height={h}
          rx={1}
          fill={state === "selected" ? "var(--m-chili)" : "var(--m-fg-faint)"}
          fillOpacity={state === "selected" ? 1 : 0.25}
          stroke="none"
        />
      </>
    );
  }
  return <rect x={x} y={y} width={w} height={h} rx={1.5} {...common} />;
}

/* Small pips around the table hinting at cover count. */
function SeatPips({ table, selected }: { table: TableElement; selected: boolean }) {
  const { x, y, w, h, seats } = table;
  const color = selected ? "var(--m-chili)" : "var(--m-fg-faint)";
  const pips: { px: number; py: number }[] = [];
  const perSide = Math.ceil(seats / 2);
  for (let i = 0; i < perSide; i++) {
    const t = (i + 1) / (perSide + 1);
    pips.push({ px: x + w * t, py: y - 2.2 });
  }
  for (let i = 0; i < seats - perSide; i++) {
    const t = (i + 1) / (seats - perSide + 1);
    pips.push({ px: x + w * t, py: y + h + 2.2 });
  }
  return (
    <>
      {pips.map((p, i) => (
        <circle key={i} cx={p.px} cy={p.py} r={1.1} fill={color} fillOpacity={selected ? 0.9 : 0.5} />
      ))}
    </>
  );
}

function Fixture({ fixture }: { fixture: FixtureElement }) {
  const { x, y, w, h, kind, label } = fixture;
  const cx = x + w / 2;
  const cy = y + h / 2;

  return (
    <g aria-hidden="true" className="fp-fixture">
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={kind === "plant" ? Math.min(w, h) / 2 : 1}
        fill="var(--m-canvas-3)"
        stroke="var(--m-line)"
        strokeWidth={0.6}
        vectorEffect="non-scaling-stroke"
      />

      {/* Bar stools along the inner edge of the bar. */}
      {kind === "bar" &&
        Array.from({ length: 4 }).map((_, i) => {
          const sy = y + (h * (i + 0.5)) / 4;
          return (
            <circle
              key={i}
              cx={x - 2.4}
              cy={sy}
              r={1.3}
              fill="none"
              stroke="var(--m-fg-faint)"
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

      {/* Kitchen hatch marks to read as a service block. */}
      {kind === "kitchen" &&
        Array.from({ length: 5 }).map((_, i) => {
          const lx = x + (w * (i + 1)) / 6;
          return (
            <line
              key={i}
              x1={lx}
              y1={y + 1.5}
              x2={lx}
              y2={y + h - 1.5}
              stroke="var(--m-line)"
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fp-fixture-label"
        style={{
          fontSize: 3,
          fill: "var(--m-fg-faint)",
          fontFamily: "var(--font-mono, monospace)",
          letterSpacing: "0.1px",
          textTransform: "uppercase",
        }}
      >
        {label}
      </text>
    </g>
  );
}

export default function FloorPlan({ selectedId, onSelect, unavailableIds }: FloorPlanProps) {
  const titleId = useId();

  return (
    <div className="border border-line border-t-2 border-t-chili bg-canvas-2 p-4 md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-chili">Floor plan</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
          Street side, top
        </p>
      </div>

      <svg
        viewBox={`-4 -4 ${FLOOR_GRID.w + 8} ${FLOOR_GRID.h + 8}`}
        className="fp-svg w-full"
        role="group"
        aria-labelledby={titleId}
        style={{ maxHeight: "70vh" }}
      >
        <title id={titleId}>Restaurant floor plan. Select a table to set a seating preference.</title>

        {/* Room boundary. */}
        <rect
          x={0}
          y={0}
          width={FLOOR_GRID.w}
          height={FLOOR_GRID.h}
          fill="none"
          stroke="var(--m-line)"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />

        {/* Blueprint grid. */}
        <g aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => {
            const p = ((i + 1) * FLOOR_GRID.w) / 10;
            return (
              <g key={i}>
                <line
                  x1={p}
                  y1={0}
                  x2={p}
                  y2={FLOOR_GRID.h}
                  stroke="var(--m-line)"
                  strokeWidth={0.4}
                  strokeOpacity={0.5}
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={0}
                  y1={p}
                  x2={FLOOR_GRID.w}
                  y2={p}
                  stroke="var(--m-line)"
                  strokeWidth={0.4}
                  strokeOpacity={0.5}
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </g>

        {/* Fixtures, drawn under the tables as context. */}
        {FIXTURES.map((f) => (
          <Fixture key={f.id} fixture={f} />
        ))}

        {/* Selectable tables. */}
        {TABLES.map((table) => {
          const selected = selectedId === table.id;
          const unavailable = unavailableIds?.has(table.id) ?? false;
          const state: "available" | "selected" | "unavailable" = unavailable
            ? "unavailable"
            : selected
              ? "selected"
              : "available";
          const cx = table.x + table.w / 2;
          const cy = table.y + table.h / 2;

          const activate = () => {
            if (unavailable) return;
            onSelect({ id: table.id, label: table.label, seats: table.seats, zone: table.zone });
          };

          return (
            <g
              key={table.id}
              role="button"
              tabIndex={unavailable ? -1 : 0}
              aria-pressed={selected}
              aria-disabled={unavailable || undefined}
              aria-label={`Table ${table.label}, ${ZONE_LABEL[table.zone]}, seats ${table.seats}${
                selected ? ", selected" : ""
              }`}
              className={`fp-table ${unavailable ? "fp-table-off" : ""}`}
              onClick={activate}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  activate();
                }
              }}
            >
              {/* Invisible hit area so the whole box (and its seat pips) is clickable. */}
              <rect
                x={table.x - 3}
                y={table.y - 3}
                width={table.w + 6}
                height={table.h + 6}
                fill="transparent"
              />
              <SeatPips table={table} selected={selected} />
              <TableBody table={table} state={state} />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: 4,
                  fill: selected ? "var(--m-cream, #f6efe2)" : "var(--m-fg)",
                  fontFamily: "var(--font-mono, monospace)",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {table.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.12em] text-fg-faint">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 border border-fg-faint" /> Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 border border-chili bg-chili" /> Selected
        </span>
        <span>Seats shown as pips</span>
      </div>

      <style>{`
        .fp-svg { touch-action: manipulation; }
        .fp-table { cursor: pointer; outline: none; }
        .fp-table-off { cursor: not-allowed; }
        .fp-table:hover:not(.fp-table-off) .fp-body {
          stroke: var(--m-chili);
        }
        .fp-table:focus-visible {
          outline: 2px solid var(--m-chili);
          outline-offset: 2px;
          border-radius: 2px;
        }
        @media (prefers-reduced-motion: no-preference) {
          .fp-body { transition: stroke 160ms ease, fill 160ms ease; }
        }
      `}</style>
    </div>
  );
}
