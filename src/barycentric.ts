import { sum } from "d3-array";
import { Accessor, Coord, Barycentric } from "./types";

/**
 * Constructs a new default ternary/barycentric converter. By default, it generates an equilateral triangle on the unit circle centered at the origin.
 */
export default function barycentric() {
  const { sin, cos, PI } = Math,
    rad = PI / 180;
  let normalizeData = true; // TODO make normalizeData toggleable

  // accessor functions
  let a: Accessor = (d) => d[0];
  let b: Accessor = (d) => d[1];
  let c: Accessor = (d) => d[2];

  const angles = [-90, 150, 30]; // angles for equilateral triangle
  let [vA, vB, vC] = angles.map((d): Coord => [cos(d * rad), sin(d * rad)]); // default vertices

  /**
   * Computes normalized ternary values by summing and taking proportions of ternary data using the value accessors.
   * [Wikipedia: Composition closure operator](https://en.wikipedia.org/wiki/Compositional_data)
   */
  function normalize(_: [number, number, number]): [number, number, number] {
    const total = sum(_);
    if (total === 0) return [0, 0, 0];
    return [_[0] / total, _[1] / total, _[2] / total];
  }

  const barycentric = function (d: any): Coord {
    // TODO: ternary data type : number[] | Record<string, unknown> | Map | Set more?
    const values: [number, number, number] = [a(d), b(d), c(d)];
    const [dA, dB, dC] = normalizeData ? normalize(values) : values;

    return [
      vA[0] * dA + vB[0] * dB + vC[0] * dC,
      vA[1] * dA + vB[1] * dB + vC[1] * dC,
    ];
  };

  /**
   * Computes ternary values from coordinates (a two-element array `[x, y]`). Note that the [x, y] coordinates here are unscaled i.e. a radius of 1.
   * [Wikipedia: Conversion between barycentric and Cartesian coordinates](en.wikipedia.org/wiki/Barycentric_coordinate_system#Conversion_between_barycentric_and_Cartesian_coordinates)
   */
  barycentric.invert = function ([x, y]: Coord): [number, number, number] {
    const [xA, yA] = vA,
      [xB, yB] = vB,
      [xC, yC] = vC;

    const yByC = yB - yC,
      xCxB = xC - xB,
      xAxC = xA - xC,
      yAyC = yA - yC,
      yCyA = yC - yA,
      xxC = x - xC,
      yyC = y - yC;

    const d = yByC * xAxC + xCxB * yAyC,
      lambda1 = Math.abs((yByC * xxC + xCxB * yyC) / d),
      lambda2 = Math.abs((yCyA * xxC + xAxC * yyC) / d),
      lambda3 = Math.abs(1 - lambda1 - lambda2);

    return [lambda1, lambda2, lambda3];
  };

  /**
   * Returns the current a-value accessor, which defaults to: `const a = (d) => d[0];`
   */
  function aAccessor(): Accessor;
  /**
   * Sets the a-accessor to the specified function and returns this barycentric converter.
   */
  function aAccessor(fn: Accessor): Barycentric;

  function aAccessor(fn?: Accessor) {
    return fn ? ((a = fn), barycentric) : a;
  }

  barycentric.a = aAccessor;

  /**
   * Returns the current b-value accessor, which defaults to: `const b = (d) => d[1];`
   */
  function bAccessor(): Accessor;
  /**
   * Sets the b-accessor to the specified function and returns this barycentric converter.
   * @param fn
   * @returns barycentric
   */
  function bAccessor(fn: Accessor): Barycentric;
  function bAccessor(fn?: Accessor) {
    return fn ? ((b = fn), barycentric) : b;
  }

  barycentric.b = bAccessor;

  /**
   * Returns the current c-value accessor, which defaults to: `const c = (d) => d[2];`
   */
  function cAccessor(): Accessor;
  /**
   * Sets the c-accessor to the specified function and returns this barycentric converter.
   * @param fn
   * @returns barycentric
   */
  function cAccessor(fn: Accessor): Barycentric;
  function cAccessor(fn?: Accessor) {
    return fn ? ((c = fn), barycentric) : c;
  }

  barycentric.c = cAccessor;

  barycentric.normalize = normalize;

  /**
   * Returns the current vertices, which defaults to the vertices of an equilateral triangle with radius 1 with angles -90°, 150°, 30°.
   */
  function vertices(): [Coord, Coord, Coord];
  /**
   * Sets the vertices to the specified array and returns this barycentric converter.
   */
  function vertices(ABC: readonly [Coord, Coord, Coord]): typeof barycentric;
  function vertices(ABC?: readonly [Coord, Coord, Coord]) {
    return ABC
      ? ((vA = ABC[0]), (vB = ABC[1]), (vC = ABC[2]), barycentric)
      : ([vA, vB, vC] as [Coord, Coord, Coord]);
  }

  barycentric.vertices = vertices;

  return barycentric;
}
