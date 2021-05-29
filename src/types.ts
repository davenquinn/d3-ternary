import { ScaleLinear } from "d3-scale";
import { default as ternaryPlot } from "./ternaryPlot"
import { default as barycentric } from "./barycentric"

export type TernaryPlot = ReturnType<typeof ternaryPlot>;

export type Barycentric = ReturnType<typeof barycentric>

export interface Transform {
  k: number;
  x: number;
  y: number;
}

export type Domains = [[number, number], [number, number], [number, number]];

export type Coord = [number, number];

export type TextAnchor = "start" | "middle" | "end"

export interface AxisLabel {
  label : string | number;
  angle : number;
  position: Coord;
}

export interface Tick {
  tick: number | string; 
  angle: number; 
  textAnchor: TextAnchor; 
  size: number; 
  position: Coord
}

export interface TernaryAxis {
  label: string;
  labelAngle: number;
  labelOffset: number;
  gridLine: (t: number) => Coord;
  scale: ScaleLinear<number, number, never>;
  tickAngle: number;
  tickSize: number;
  tickTextAnchor: TextAnchor;
  conjugate: TernaryAxis | null;
}

export type Accessor = (d: any) => number;
