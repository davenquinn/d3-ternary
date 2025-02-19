/**
 * Constructs a new barycentric converter. Uses an equilateral triangle with unit height.
 */
export declare function barycentric(): {
    (d: any): [number, number];
    barycentricToCartesian: ([a, b, c]: [number, number, number]) => [x: number, y: number];
    unscaled(d: [number, number, number]): [number, number];
    invert([x, y]: [number, number]): [number, number, number];
    a(fn?: (d: any) => number): ((d: any) => number) | /*elided*/ any;
    b(fn?: (d: any) => number): ((d: any) => number) | /*elided*/ any;
    c(fn?: (d: any) => number): ((d: any) => number) | /*elided*/ any;
    rotation(_?: number): number | /*elided*/ any;
    domains(domains?: [[number, number], [number, number], [number, number]]): /*elided*/ any | number[][];
    scales(): import("d3-scale").ScaleLinear<number, number, never>[];
};
export declare function getDomainLengths(domains: [[number, number], [number, number], [number, number]]): Set<number>;
