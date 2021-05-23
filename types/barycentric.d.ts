import { Accessor, Coord, Barycentric } from "./types";
/**
 * Constructs a new default ternary/barycentric converter. By default, it makes an equilateral triangle on the unit circle centered the origin.
 */
export default function barycentric(): {
    (d: any): Coord;
    /**
     * Computes ternary values from coordinates (a two-element array `[x, y]`). Note that the [x, y] coordinates here are unscaled i.e. a radius of 1.
     * */
    invert([x, y]: Coord): [number, number, number];
    a: {
        (): Accessor;
        (fn: Accessor): Barycentric;
    };
    b: {
        (): Accessor;
        (fn: Accessor): Barycentric;
    };
    c: {
        (): Accessor;
        (fn: Accessor): Barycentric;
    };
    normalize: (_: any) => [number, number, number];
    vertices: {
        (): [Coord, Coord, Coord];
        (ABC: [Coord, Coord, Coord]): any;
    };
};