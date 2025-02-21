import type { barycentric } from "./barycentric";
import type { ternaryPlot } from "./ternaryPlot";
export { barycentric } from "./barycentric";
export { ternaryPlot } from "./ternaryPlot";

export type TernaryPlot = ReturnType<typeof ternaryPlot>;

export type Barycentric = ReturnType<typeof barycentric>;

export type TextAnchor = "start" | "middle" | "end";

export type AxisLabel = {
  position: [x: number, y: number];
  label: string;
  angle: number;
};

export type Tick = {
  tick: string;
  angle: number;
  textAnchor: string;
  size: number;
  position: [x: number, y: number];
};

export type Ticks = [Array<Tick>, Array<Tick>, Array<Tick>];

export type GridLine = [
  start: [x: number, y: number],
  end: [x: number, y: number],
];

export type GridLines = [Array<GridLine>, Array<GridLine>, Array<GridLine>];
