import type { AxisLabel, Barycentric, GridLines, TernaryPlot, TextAnchor, Ticks } from "./types";
/**
 * Constructs a new ternary plot using the provided barycentric converter
 */
export declare function ternaryPlot(barycentric: Barycentric): {
    (d: [number, number, number]): [x: number, y: number];
    triangle(): string;
    gridLines: {
        (count: number): GridLines;
        (count: [number, number, number]): GridLines;
    };
    axisLabels({ center }?: {
        center?: boolean | undefined;
    }): [a: AxisLabel, b: AxisLabel, c: AxisLabel];
    ticks: (count: [a: number, b: number, c: number]) => Ticks;
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
    tickSizes: {
        (): [number, number, number];
        (_: number): TernaryPlot;
        (_: readonly [number, number, number]): TernaryPlot;
    };
    labelOffsets: {
        (): [a: number, b: number, c: number];
        (_: [a: number, b: number, c: number]): TernaryPlot;
        (_: number): TernaryPlot;
    };
};
