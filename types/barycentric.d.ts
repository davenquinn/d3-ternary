import type { Barycentric } from "types";
/**
 * Constructs a new barycentric converter. Uses an equilateral triangle with unit height.
 */
export declare function barycentric(): {
    (d: any): [number, number];
    unscaled(d: [number, number, number]): [number, number];
    invert([x, y]: [number, number]): [number, number, number];
    a(fn?: (d: any) => number): ((d: any) => number) | /*elided*/ any;
    b(fn?: (d: any) => number): ((d: any) => number) | /*elided*/ any;
    c(fn?: (d: any) => number): ((d: any) => number) | /*elided*/ any;
    rotation: {
        (): number;
        (_: number): Barycentric;
    };
    domains: {
        (): [[start: number, end: number], [start: number, end: number], [start: number, end: number]];
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
