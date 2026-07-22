/**
 * Floor plan data for the /reserve page, drawn from config so the room is data,
 * not artwork. Everything lives on a 100x100 grid; x/y are the top-left of the
 * element's box, w/h its size, all in grid units. The renderer scales the grid
 * to an SVG viewBox.
 *
 * NOTE: this is a plausible small-restaurant layout, NOT a survey of the real
 * room. Per PLAN 7.1, get a sketch from the owner before presenting the picker
 * as a promise; until then treat table choice as a seating preference.
 */

export type TableShape = "round" | "square" | "booth";
export type Zone = "window" | "main" | "booth";
export type FixtureKind = "entrance" | "bar" | "kitchen" | "toilets" | "plant";

interface Base {
  id: string;
  /** grid coordinates, 0..100 */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TableElement extends Base {
  kind: "table";
  label: string;
  seats: number;
  shape: TableShape;
  zone: Zone;
}

export interface FixtureElement extends Base {
  kind: FixtureKind;
  label: string;
}

export type FloorElement = TableElement | FixtureElement;

/** Selectable tables. */
export const TABLES: TableElement[] = [
  // Window run along the top (street side).
  { id: "t1", kind: "table", label: "T1", seats: 2, shape: "round", zone: "window", x: 12, y: 8, w: 12, h: 12 },
  { id: "t2", kind: "table", label: "T2", seats: 2, shape: "round", zone: "window", x: 32, y: 8, w: 12, h: 12 },
  { id: "t3", kind: "table", label: "T3", seats: 4, shape: "square", zone: "window", x: 52, y: 8, w: 14, h: 14 },
  // Main floor centre.
  { id: "t4", kind: "table", label: "T4", seats: 4, shape: "square", zone: "main", x: 14, y: 36, w: 14, h: 14 },
  { id: "t5", kind: "table", label: "T5", seats: 4, shape: "square", zone: "main", x: 40, y: 36, w: 14, h: 14 },
  { id: "t6", kind: "table", label: "T6", seats: 2, shape: "round", zone: "main", x: 66, y: 38, w: 12, h: 12 },
  { id: "t7", kind: "table", label: "T7", seats: 6, shape: "square", zone: "main", x: 26, y: 60, w: 20, h: 14 },
  // Booth row along the left wall.
  { id: "b1", kind: "table", label: "B1", seats: 4, shape: "booth", zone: "booth", x: 4, y: 78, w: 22, h: 12 },
  { id: "b2", kind: "table", label: "B2", seats: 6, shape: "booth", zone: "booth", x: 30, y: 78, w: 26, h: 12 },
];

/** Non-selectable fixtures for orientation. */
export const FIXTURES: FixtureElement[] = [
  { id: "entrance", kind: "entrance", label: "Entrance", x: 78, y: 88, w: 18, h: 8 },
  { id: "bar", kind: "bar", label: "Bar", x: 80, y: 8, w: 14, h: 44 },
  { id: "kitchen", kind: "kitchen", label: "Kitchen", x: 66, y: 62, w: 30, h: 18 },
  { id: "toilets", kind: "toilets", label: "WC", x: 4, y: 8, w: 6, h: 14 },
  { id: "plant", kind: "plant", label: "Plant", x: 4, y: 60, w: 6, h: 6 },
];

export const FLOOR_PLAN: FloorElement[] = [...TABLES, ...FIXTURES];

/** Grid dimensions the coordinates are expressed against. */
export const FLOOR_GRID = { w: 100, h: 100 } as const;
