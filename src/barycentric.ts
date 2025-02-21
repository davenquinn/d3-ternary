import { scaleLinear } from "d3-scale";
import type { Barycentric } from "./types";

/**
 * Constructs a new barycentric converter. Uses an equilateral triangle with unit height.
 */
export function barycentric() {
  /** rotation angle in degrees */
  let rotation = 0;

  type Accessor = (d: any) => number;

  let a: Accessor = (d: any) => d[0];
  let b: Accessor = (d: any) => d[1];
  let c: Accessor = (d: any) => d[2];

  // domain scales
  const scaleA = scaleLinear().domain([0, 1]);
  const scaleB = scaleLinear().domain([0, 1]);
  const scaleC = scaleLinear().domain([0, 1]);

  const radian = Math.PI / 180;
  const [vA, vB, vC] = [-90, 150, 30].map((d) => [
    Math.cos(d * radian),
    Math.sin(d * radian),
  ]);

  /**
   * Converts barycentric coordinates to cartesian coordinates
   */
  function barycentricToCartesian([a, b, c]: [number, number, number]): [
    x: number,
    y: number,
  ] {
    return [
      a * vA[0] + b * vB[0] + c * vC[0],
      a * vA[1] + b * vB[1] + c * vC[1],
    ];
  }

  /**
   * Applies rotation to cartesian coordinates
   */
  function rotate(x: number, y: number): [x: number, y: number] {
    const rad = (rotation * Math.PI) / 180;
    const ca = Math.cos(rad);
    const sa = Math.sin(rad);
    return [x * ca + y * sa, y * ca - x * sa];
  }

  /**
   * Computes normalized ternary values
   */
  function normalize([a, b, c]: [number, number, number]): [
    number,
    number,
    number,
  ] {
    if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c)) {
      throw new Error("Invalid ternary coordinates: values must be numbers");
    }
    const [na, nb, nc] = [Number(a), Number(b), Number(c)];
    const total = na + nb + nc;

    return total === 0 ? [0, 0, 0] : [na / total, nb / total, nc / total];
  }

  const barycentric = function (d: unknown): [x: number, y: number] {
    const [dA, dB, dC] = normalize([a(d), b(d), c(d)]);
    const [x, y] = barycentricToCartesian([scaleA(dA), scaleB(dB), scaleC(dC)]);

    return rotate(x, y);
  };

  barycentric.unscaled = function (
    d: [number, number, number],
  ): [number, number] {
    const [dA, dB, dC] = normalize(d);
    const [x, y] = barycentricToCartesian([dA, dB, dC]);

    return rotate(x, y);
  };

  /**
   * Computes ternary values from coordinates
   */
  barycentric.invert = function ([x, y]: [number, number]): [
    number,
    number,
    number,
  ] {
    // Remove rotation
    const rad = (-rotation * Math.PI) / 180;
    const ca = Math.cos(rad);
    const sa = Math.sin(rad);
    const rx = x * ca + y * sa;
    const ry = y * ca - x * sa;

    // en.wikipedia.org/wiki/Barycentric_coordinate_system#Conversion_between_barycentric_and_Cartesian_coordinates
    const [xA, yA] = vA,
      [xB, yB] = vB,
      [xC, yC] = vC;

    const yByC = yB - yC,
      xCxB = xC - xB,
      xAxC = xA - xC,
      yAyC = yA - yC,
      yCyA = yC - yA,
      xxC = rx - xC,
      yyC = ry - yC;

    const d = yByC * xAxC + xCxB * yAyC,
      lambda1 = Math.abs((yByC * xxC + xCxB * yyC) / d),
      lambda2 = Math.abs((yCyA * xxC + xAxC * yyC) / d),
      lambda3 = Math.abs(1 - lambda1 - lambda2);

    // Invert through scales
    return [
      scaleA.invert(lambda1),
      scaleB.invert(lambda2),
      scaleC.invert(lambda3),
    ];
  };

  /**
   * Returns the current accessor function for the A component, which defaults to:
   * ```ts
   * (d) => d[0]
   * ```
   */
  barycentric.a = function (fn?: Accessor) {
    return fn ? ((a = fn), barycentric) : a;
  };

  /**
   * Returns the current accessor function for the B component, which defaults to:
   * ```ts
   * (d) => d[1]
   * ```
   */
  barycentric.b = function (fn?: Accessor) {
    return fn ? ((b = fn), barycentric) : b;
  };

  /**
   * Returns the current accessor function for the C component, which defaults to:
   * ```ts
   * (d) => d[2]
   * ```
   */
  barycentric.c = function (fn?: Accessor) {
    return fn ? ((c = fn), barycentric) : c;
  };

  /**
   * Returns the current rotation angle in degrees, which defaults to 0.
   */
  function rotationFn(): number;
  /**
   * Sets the rotation angle to the specified angle in degrees and returns the barycentric converter.
   * Positive angles rotate the plot clockwise.
   */
  function rotationFn(angle: number): Barycentric;
  function rotationFn(_?: number) {
    if (!arguments.length) return rotation;
    rotation = _ ?? 0;
    return barycentric;
  }
  barycentric.rotation = rotationFn;

  /**
   * Returns an array of the current domains.
   * Each domain is a two-element array containing the start and end values, in order of `[A, B, C]`.
   */
  function domainsFn(): [[number, number], [number, number], [number, number]];
  /**
   * Sets the domains for each axis and returns the barycentric converter.
   * Each domain is a two-element array containing the start and end values, in order of `[A, B, C]`.
   */
  function domainsFn(
    domains: [
      [start: number, end: number],
      [start: number, end: number],
      [start: number, end: number],
    ],
  ): Barycentric;
  function domainsFn(
    domains?: [
      [start: number, end: number],
      [start: number, end: number],
      [start: number, end: number],
    ],
  ) {
    if (!domains) {
      return [scaleA.domain(), scaleB.domain(), scaleC.domain()];
    }

    const lengths = getDomainLengths(domains);

    if (lengths.size !== 1) {
      throw new Error("All domains must have the same length");
    }
    scaleA.domain(domains[0]);
    scaleB.domain(domains[1]);
    scaleC.domain(domains[2]);

    return barycentric;
  }
  barycentric.domains = domainsFn;

  /**
   * Returns the scales for the three axes
   */
  barycentric.scales = function () {
    return [scaleA, scaleB, scaleC];
  };

  return barycentric;
}

export function getDomainLengths(
  domains: [
    [start: number, end: number],
    [start: number, end: number],
    [start: number, end: number],
  ],
) {
  return new Set(
    domains.map((domain) => {
      // round differences
      // https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
      const d0 = Math.round((domain[0] + Number.EPSILON) * 100) / 100;
      const d1 = Math.round((domain[1] + Number.EPSILON) * 100) / 100;
      const difference = Math.abs(d1 - d0);

      return Math.round((difference + Number.EPSILON) * 100) / 100;
    }),
  );
}
