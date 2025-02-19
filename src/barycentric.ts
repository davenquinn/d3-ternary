import { scaleLinear } from "d3-scale";

/**
 * Constructs a new barycentric converter. Uses an equilateral triangle with unit height.
 */
export function barycentric() {
  const sqrt3_2 = Math.sqrt(3) / 2;

  /** rotation angle in degrees */
  let rotation = 0;

  // Add type for accessor function
  type Accessor = (d: any) => number;

  // Update accessor declarations with types
  let a: Accessor = (d) => d[0];
  let b: Accessor = (d) => d[1];
  let c: Accessor = (d) => d[2];

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

  const barycentric = function (d: any): [number, number] {
    const [dA, dB, dC] = normalize([a(d), b(d), c(d)]);
    const [x, y] = barycentricToCartesian([scaleA(dA), scaleB(dB), scaleC(dC)]);

    return rotate(x, y);
  };

  barycentric.barycentricToCartesian = barycentricToCartesian;

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

    // Convert to barycentric coordinates
    const b = -ry / sqrt3_2;
    const a = rx - b * 0.5;
    const c = 1 - a - b;

    // Invert through scales
    return [scaleA.invert(a), scaleB.invert(b), scaleC.invert(c)];
  };

  barycentric.a = function (fn?: Accessor): Accessor | typeof barycentric {
    return fn ? ((a = fn), barycentric) : a;
  };

  barycentric.b = function (fn?: Accessor): Accessor | typeof barycentric {
    return fn ? ((b = fn), barycentric) : b;
  };

  barycentric.c = function (fn?: Accessor): Accessor | typeof barycentric {
    return fn ? ((c = fn), barycentric) : c;
  };

  /**
   * Sets the rotation angle in degrees
   */
  barycentric.rotation = function (_?: number) {
    if (!arguments.length) return rotation;
    rotation = _ ?? 0;
    return barycentric;
  };

  // Add types for domains
  type Domain = [number, number];

  /**
   * Sets or gets the domains for each axis
   */
  barycentric.domains = function (domains?: [Domain, Domain, Domain]) {
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
  };

  /**
   * Returns the scales for each axis
   */
  barycentric.scales = function () {
    return [scaleA, scaleB, scaleC];
  };

  return barycentric;
}

export function getDomainLengths(
  domains: [[number, number], [number, number], [number, number]],
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
