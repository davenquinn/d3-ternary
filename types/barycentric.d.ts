import type { Barycentric } from "./types";
/**
 * Constructs a new barycentric converter. Uses an equilateral triangle with unit height.
 */
export declare function barycentric<T = [number, number, number]>(): Barycentric<T>;
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
