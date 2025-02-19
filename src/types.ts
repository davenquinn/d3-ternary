import { ternaryPlot } from "./ternaryPlot";
import { barycentric } from "./barycentric";
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
export type Tick = ReturnType<TernaryPlot["ticks"]>[number];
export type GridLine = ReturnType<TernaryPlot["gridLines"]>[number];
