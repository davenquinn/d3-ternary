import { getDomainLengths } from "barycentric";

/**
 * Computes the domain ranges for each axis given a transform object from d3.zoom.
 * The transform object contains scale (k) and translation (x,y) values.
 * 
 * This function ensures the domains stay within valid bounds and maintains 
 * equal domain lengths across all axes.
 * 
 * @param transform - Object containing zoom transform parameters:
 *   - k: scale factor (zoom level)
 *   - x: x-translation 
 *   - y: y-translation
 * @returns Array of [start,end] domain ranges for axes A, B, and C
 * @throws Error if zoom level or translation would create invalid domains
 */
export function domainsFromTransform(transform: {
  k: number;
  x: number;
  y: number;
}) {
  const { k, x, y } = transform;

  const domainLength = 1 / k;

  if (domainLength > 1) {
    throw new Error(
      `Invalid zoom level: ${k}. Cannot zoom out beyond the original triangle.`,
    );
  }

  const untranslatedDomainStart = (k - 1) / (k * 3);

  const radian = Math.PI / 180;
  const [vA, vB, vC] = [-90, 150, 30].map((d) => [
    Math.cos(d * radian),
    Math.sin(d * radian),
  ]);

  // Solve system of equations to find shifts
  const det =
    vA[0] * (vB[1] - vC[1]) + vB[0] * (vC[1] - vA[1]) + vC[0] * (vA[1] - vB[1]);

  const shiftA = ((x / k) * (vB[1] - vC[1]) + (y / k) * (vC[0] - vB[0])) / det;
  const shiftB = ((x / k) * (vC[1] - vA[1]) + (y / k) * (vA[0] - vC[0])) / det;
  const shiftC = ((x / k) * (vA[1] - vB[1]) + (y / k) * (vB[0] - vA[0])) / det;

  // Calculate initial domain starts
  const domainAStart = untranslatedDomainStart - shiftA;
  const domainBStart = untranslatedDomainStart - shiftB;
  const domainCStart = untranslatedDomainStart - shiftC;

  const domainAEnd = domainAStart + domainLength;
  const domainBEnd = domainBStart + domainLength;
  const domainCEnd = domainCStart + domainLength;

  // Check if any domain goes outside [0,1] range with some tolerance
  const epsilon = 10e-6;
  const min = 0 - epsilon;
  const max = 1 + epsilon;
  if (domainAStart < min || domainAEnd > max) {
    throw new Error(
      `New domain A exceeds bounds ${[domainAStart, domainAEnd]}`,
    );
  }
  if (domainBStart < min || domainBEnd > max) {
    throw new Error(
      `New domain B exceeds bounds ${[domainBStart, domainBEnd]}`,
    );
  }
  if (domainCStart < min || domainCEnd > max) {
    throw new Error(
      `New domain C exceeds bounds ${[domainCStart, domainCEnd]}`,
    );
  }
  return [
    [domainAStart, domainAEnd],
    [domainBStart, domainBEnd],
    [domainCStart, domainCEnd],
  ];
}

/**
 * Computes the d3.zoom transform parameters that would create the given domain ranges.
 * This is the inverse of domainsFromTransform().
 * 
 * Used to sync the zoom and pan state to match specified domain ranges.
 * The returned transform can be passed to d3.zoom.transform() to update the view.
 * 
 * @param domains - Array of [start,end] domain ranges for axes A, B, and C
 * @returns Object with zoom transform parameters:
 *   - k: scale factor (zoom level)
 *   - x: x-translation (unscaled by radius)
 *   - y: y-translation (unscaled by radius)
 */
export function transformFromDomains(
  domains: [[number, number], [number, number], [number, number]],
) {
  const [domainA, domainB, domainC] = domains;

  const domainLengths = getDomainLengths(domains);
  const domainLength = [...domainLengths][0];

  const k = 1 / domainLength;

  const untranslatedDomainStart = (k - 1) / (k * 3); // find start value of centered, untranslated domain for this scale

  const shiftA = untranslatedDomainStart - domainA[0];
  const shiftB = untranslatedDomainStart - domainB[0];
  const shiftC = untranslatedDomainStart - domainC[0];

  const radian = Math.PI / 180;
  const [vA, vB, vC] = [-90, 150, 30].map((d) => [
    Math.cos(d * radian),
    Math.sin(d * radian),
  ]);

  const [tx, ty] = [
    (vA[0] * shiftA + vB[0] * shiftB + vC[0] * shiftC) * k,
    (vA[1] * shiftA + vB[1] * shiftB + vC[1] * shiftC) * k,
  ];

  return { k, x: tx, y: ty };
}
