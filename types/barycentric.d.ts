import type { Barycentric } from "./types";
/**
 * Constructs a new barycentric converter. Uses an equilateral triangle with unit height.
 */
export declare function barycentric(): {
    (d: unknown): [x: number, y: number];
    unscaled(d: [number, number, number]): [number, number];
    invert([x, y]: [number, number]): [number, number, number];
    a(fn?: (d: unknown) => number): ((d: unknown) => number) | /*elided*/ any;
    b(fn?: (d: unknown) => number): ((d: unknown) => number) | /*elided*/ any;
    c(fn?: (d: unknown) => number): ((d: unknown) => number) | /*elided*/ any;
    rotation: {
        (): number;
        (angle: number): Barycentric;
    };
    domains: {
        (): [[number, number], [number, number], [number, number]];
        (domains: [[start: number, end: number], [start: number, end: number], [start: number, end: number]]): Barycentric;
    };
    scales(): import("d3-scale").ScaleLinear<number, number, never>[];
};
export declare function getDomainLengths(domains: [
    [
        start: number,
        end: number
    ],
    [
        start: number,
        end: number
    ],
    [
        start: number,
        end: number
    ]
]): Set<number>;
