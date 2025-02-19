import type { AxisLabel, Barycentric, TernaryPlot, TextAnchor } from "./types";
/**
 * Constructs a new ternary plot using the provided barycentric converter
 */
export declare function ternaryPlot(barycentric: Barycentric): {
    (d: [number, number, number]): [x: number, y: number];
    triangle(): string;
    gridLines(count?: number): [[start: [x: number, y: number], end: [x: number, y: number]][], [start: [x: number, y: number], end: [x: number, y: number]][], [start: [x: number, y: number], end: [x: number, y: number]][]];
    axisLabels({ center }?: {
        center?: boolean | undefined;
    }): [a: AxisLabel, b: AxisLabel, c: AxisLabel];
    ticks(count?: number): {
        tick: string;
        angle: number;
        textAnchor: string;
        size: number;
        position: [x: number, y: number];
    }[][];
    tickFormat: {
        (): string | ((d: number) => string);
        (_: string | ((d: number) => string)): TernaryPlot;
    };
    radius: {
        (): number;
        (_: number): TernaryPlot;
    };
    invert(_: [number, number]): [number, number, number];
    labels: {
        (): [a: string, b: string, c: string];
        (_: [a: string, b: string, c: string]): TernaryPlot;
    };
    tickAngles: {
        (): [a: number, b: number, c: number];
        (_: [a: number, b: number, c: number]): TernaryPlot;
    };
    labelAngles: {
        (): [a: number, b: number, c: number];
        (_: [a: number, b: number, c: number]): TernaryPlot;
    };
    tickTextAnchors: {
        (): [a: TextAnchor, b: TextAnchor, c: TextAnchor];
        (_: [a: TextAnchor, b: TextAnchor, c: TextAnchor]): TernaryPlot;
    };
    labelOffsets: {
        (): [a: number, b: number, c: number];
        (_: number): TernaryPlot;
        (_: [a: number, b: number, c: number]): TernaryPlot;
    };
};
