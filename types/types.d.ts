import { ScaleLinear } from "d3-scale";
import { default as ternaryPlot } from "./ternaryPlot";
import { default as barycentric } from "./barycentric";
export declare type TernaryPlot = ReturnType<typeof ternaryPlot>;
export declare type Barycentric = ReturnType<typeof barycentric>;
export interface Transform {
    k: number;
    x: number;
    y: number;
}
export declare type Domains = [[number, number], [number, number], [number, number]];
export declare type Coord = [number, number];
export declare type TextAnchor = "start" | "middle" | "end";
export interface AxisLabelProps {
    label: string | number;
    angle: number;
    position: Coord;
    fontSize: number;
    textAnchor: TextAnchor;
}
export interface TickProps {
    tick: number | string;
    angle: number;
    textAnchor: TextAnchor;
    size: number;
    position: Coord;
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
export declare type Accessor = (d: any) => number;
