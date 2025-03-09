import type { Barycentric, TernaryPlot } from "./types";
/**
 * Constructs a new ternary plot using the provided barycentric converter
 */
export declare function ternaryPlot<T = [number, number, number]>(barycentric: Barycentric<T>): TernaryPlot<T>;
