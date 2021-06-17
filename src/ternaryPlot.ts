import { scaleLinear } from "d3-scale";
import {
  TernaryPlot,
  Barycentric,
  Domains,
  Coord,
  Tick,
  TextAnchor,
  TernaryAxis,
  AxisLabel,
} from "./types";

const getDomainLengths = (domains: Domains) =>
  new Set(
    domains.map((domain) => {
      // round differences
      // https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
      const d0 = Math.round((domain[0] + Number.EPSILON) * 100) / 100;
      const d1 = Math.round((domain[1] + Number.EPSILON) * 100) / 100;

      return Math.abs(d1 - d0);
    })
  );

/**
 * Calculate shift in x and y from distance between two perpendicular lines
 *
 * @param m {number} Slope
 * @param c {number} distance between two perpendicular lines
 * @returns distances
 */
const getdXdY = (m: number, c: number): [number, number] => {
  // slope m = dy/dx = tan(Θ)
  const theta = Math.atan(m); // radians
  const dx = c * Math.cos(theta) * Math.sign(theta); // ! using Math.sign() is questionable?
  const dy = c * Math.sin(theta) * Math.sign(theta);

  return [dx, dy];
};

/**
 * Calculate offsets needed to move transform within initial triangle
 * @param m
 * @param distance
 * @returns
 */
const getTranslateCorrections = (
  m: number,
  distance: number
): [number, number] => {
  // ! 🌶 distance shouldn't always have negative sign only if line is below origin
  if (m === 0) return [0, -distance]; // for horizontal lines

  const inverseSlope = -1 / m;

  return getdXdY(inverseSlope, distance);
};

/**
 * Currying function that returns a function that
 * @param param0 coord
 * @param param1 coord
 * @returns function that
 */
function lineBetween([x1, y1]: Coord, [x2, y2]: Coord) {
  return function (t: number): Coord {
    return [x1 + t * (x2 - x1), y1 + t * (y2 - y1)];
  };
}

/**
 * Calculate the slope of a line between two cartesian points
 *
 * @param param0 coordinates of starting point
 * @param param1 coordinates of end point
 * @returns {number} slope
 */
const getSlope = ([x1, y1]: Coord, [x2, y2]: Coord) => (y2 - y1) / (x2 - x1);
const epsilon = 1e-4;

const insideDomain = (n: number) => (n > 0.999999 ? 1 : n < 0.000001 ? 0 : n);

/**
 * Calculate distance between to parallel liens
 * https://en.wikipedia.org/wiki/Distance_between_two_parallel_lines
 *
 * @param b1
 * @param b2
 * @param m slope
 * @returns
 */
const parallelLinesDistance = (b1: number, b2: number, m: number) =>
  ((b2 - b1) * Math.sign(b1)) / Math.sqrt(m ** 2 + 1); // ! using * Math.sign(b1) is hacky tho

export default function ternaryPlot(barycentric: Barycentric) {
  let radius = 300,
    k = 1, // scale
    tx = 0, // translate
    ty = 0,
    tickFormat: string | ((tick: number) => string) = "%",
    reverse = false;

  let unscaledVertices = barycentric.vertices(); // original unscaled vertices

  // return this function, has access to all closed over variables in the parent 'ternaryPlot' function
  function ternaryPlot(_: any): Coord {
    const [x, y] = barycentric(_);

    return [x * radius, y * radius];
  }

  /**
   * Returns the plots current, scaled vertices.
   */
  function scaleVertices(): [Coord, Coord, Coord];
  /**
   * Unscales _newScaledVertices_ and sets the vertices of the _barycentric()_ function passed to _ternaryPlot()_.
   * @param newScaledVertices
   */
  function scaleVertices(
    newScaledVertices: [Coord, Coord, Coord]
  ): typeof ternaryPlot;
  function scaleVertices(newScaledVertices?: [Coord, Coord, Coord]) {
    if (newScaledVertices) {
      const newUnscaledVertices = newScaledVertices.map(
        ([x, y]: Coord): Coord => [x / radius, y / radius]
      );

      barycentric.vertices(newUnscaledVertices as [Coord, Coord, Coord]);

      return ternaryPlot;
    }

    const vertices = barycentric.vertices();

    let scaledVertices = vertices.map(
      ([x, y]: Coord): Coord => [x * radius, y * radius]
    );

    return scaledVertices as [Coord, Coord, Coord];
  }

  let [svA, svB, svC] = scaleVertices();

  // axes configurations
  // domain from vC (angle: 30°) to vA (angle: -90°)
  let A: TernaryAxis = {
    label: "A",
    labelAngle: 0,
    labelOffset: 45, // 🤔💭 or relative to radius? labelOffset: radius / 10
    gridLine: lineBetween(svC, svA),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: 0,
    tickSize: 6,
    tickTextAnchor: "start",
    conjugate: null,
  };

  // domain from svA (angle: -90°) to svB (angle: 150°)
  let B: TernaryAxis = {
    label: "B",
    labelAngle: 60,
    labelOffset: 45,
    gridLine: lineBetween(svA, svB),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: 60,
    tickSize: 6,
    tickTextAnchor: "end",
    conjugate: null,
  };

  // domain from vB (angle: 150°) to vC (angle: 30°)
  let C: TernaryAxis = {
    label: "C",
    labelAngle: -60,
    labelOffset: 45,
    gridLine: lineBetween(svB, svC),
    scale: scaleLinear().domain([0, 1]),
    tickAngle: -60,
    tickSize: 6,
    tickTextAnchor: "end",
    conjugate: null,
  };

  // just a nicety for the gridlines function
  A.conjugate = B;
  B.conjugate = C;
  C.conjugate = A;

  ternaryPlot.vertices = scaleVertices;

  /**
   * Generates and return an array containing axis label objects. Each axis label object contains the following properties.
   * - `position`: an array of [x,y] coords
   * - `labelAngle`: the rotation of the axis label
   * - `label`: The axis label
   *
   * Takes an optional configuration object that specifies whether axis labels should be placed at the center of the axis, the default is `false`.
   */
  ternaryPlot.axisLabels = function ({ center = false } = {}) {
    return [A, B, C].map((d): AxisLabel => {
      const { label, labelAngle } = d;
      const [x, y] = d.gridLine(center ? 0.5 : 1);
      const position: Coord = [
        (x / radius) * (radius + d.labelOffset),
        (y / radius) * (radius + d.labelOffset),
      ];

      return {
        position,
        label,
        angle: labelAngle,
      };
    }) as [AxisLabel, AxisLabel, AxisLabel];
  };

  // set domains without applying matching transform
  ternaryPlot.setDomains = function (domains: Domains) {
    const [domainA, domainB, domainC] = domains;

    A.scale.domain(domainA);
    B.scale.domain(domainB);
    C.scale.domain(domainC);

    return ternaryPlot;
  };

  ternaryPlot.reverseVertices = function () {
    // 'swap' vertices clockwise
    reverse = true;
    const swappedVertices: [Coord, Coord, Coord] = [svC, svA, svB];
    const [vA, vB, vC] = unscaledVertices;
    unscaledVertices = [vC, vA, vB]; // needed for .transform() and transformFromDomains() & .domainsFromVertices() to work
    ternaryPlot.vertices(swappedVertices);

    // swap gridLines
    A.gridLine = lineBetween(svA, svC);
    B.gridLine = lineBetween(svB, svA);
    C.gridLine = lineBetween(svC, svB);

    return ternaryPlot;
  };

  // checks if domains are reversed and applies appropriate transform for partial domain

  /**
   * Returns the current domains, which defaults to `[[0, 1], [0, 1], [0, 1]]`.
   */
  function domainsFunc(): Domains;
  /**
   * Sets the domains of the ternary plot to the specified domains in order `[A, B, C]` and checks if the supplied domains are reversed.
   * If this is the case, [`reverseVertices()`](#ternaryPlotReverseVertices) is called. The scale and translation offset associated with
   * the domains are [applied](#ternaryPlotTransformDoc) to correctly scale and translate the plot. At last it returns the ternaryPlot.
   */
  function domainsFunc(domains: Domains): TernaryPlot;
  function domainsFunc(domains?: Domains) {
    if (!domains) return [A.scale.domain(), B.scale.domain(), C.scale.domain()];

    const domainLengths = getDomainLengths(domains);
    if (domainLengths.size !== 1) {
      throw new Error("Domains must all be of equal length");
    }

    const isReverseDomain = domains.every((d) => d[0] > d[1]);

    if (isReverseDomain) {
      ternaryPlot.reverseVertices();
    } else {
      reverse = false; // in case domains switch from reverse to normal
    }

    ternaryPlot.setDomains(domains);

    // Get transform corresponding to this domain
    const { x, y, k } = ternaryPlot.transformFromDomains(domains);

    // Set and apply transform ie update barycentric coord system
    ternaryPlot.translate([x, y]);
    ternaryPlot.scale(k);

    return ternaryPlot;
  }
  ternaryPlot.domains = domainsFunc;

  /**
   * Generates and return an array of arrays containing each grid line objects. If counts is not specified,
   * it defaults to 20. *Counts* can be a number or an array of numbers, one for each axis in order of `[A, B, C]`.
   * Each array contains `counts` elements of two-element arrays with the start- and end coordinates of the grid line in two-element arrays.
   * @param counts
   * @returns [[Coord, Coord][], [Coord, Coord][], [Coord, Coord][]];
   */
  ternaryPlot.gridLines = function (counts = 20) {
    return [A, B, C].map((axis, i) => {
      const gridCount = Array.isArray(counts) ? +counts[i] : +counts;
      const gridValues = axis.scale.ticks(gridCount - 1); // forgot what the -1 was for

      return gridValues.map((d) => [
        axis.gridLine(axis.scale(d)),
        axis.conjugate!.gridLine(1 - axis.scale(d)),
      ]);
    }) as [[Coord, Coord][], [Coord, Coord][], [Coord, Coord][]];
  };

  /**
   * Generates and return an array of arrays containing each grid line objects. If counts is not specified
   * it defaults to 20. *Counts* can be a number or an array of numbers, one for each axis in order of `[A, B, C]`.
   * Each array contains `counts` elements of two-element arrays with the start- and end coordinates of the grid line in two-element arrays.
   * @param counts
   * @returns
   */
  function ticksFunc(counts: number): Tick[][];
  function ticksFunc(counts: [number, number, number]): Tick[][];
  function ticksFunc(counts: number | [number, number, number] = 10): Tick[][] {
    return [A, B, C].map((axis, i) => {
      const tickCount = Array.isArray(counts) ? +counts[i] : +counts;
      const tickValues = axis.scale.ticks(tickCount); //

      const format =
        typeof tickFormat === "function"
          ? tickFormat
          : axis.scale.tickFormat(tickCount, tickFormat);

      return tickValues.map((tick: number): Tick => {
        const tickPos = reverse ? 1 - axis.scale(tick) : axis.scale(tick); // not a fan of using 'reverse' boolean
        return {
          tick: format(tick),
          position: axis.gridLine(tickPos),
          angle: axis.tickAngle,
          size: axis.tickSize,
          textAnchor: axis.tickTextAnchor,
        };
      });
    });
  }
  ternaryPlot.ticks = ticksFunc;

  /**
   * Returns the current tick angles, which defaults to `[0, 60, -60]`.
   */
  function tickAngles(): [number, number, number];
  /**
   * Sets the angle of axis ticks to the specified angles in order `[A, B, C]` and returns the ternary plot. If _angles_ is not specified, returns the current tick angles, which defaults to `[0, 60, -60]`.
   *
   * @param tickAngles
   */
  function tickAngles(tickAngles: [number, number, number]): TernaryPlot;
  function tickAngles(tickAngles?: [number, number, number]) {
    return tickAngles
      ? ((A.tickAngle = tickAngles[0]),
        (B.tickAngle = tickAngles[1]),
        (C.tickAngle = tickAngles[2]),
        ternaryPlot)
      : [A.tickAngle, B.tickAngle, C.tickAngle];
  }
  ternaryPlot.tickAngles = tickAngles;

  /**
   * Returns the current tick sizes, which defaults to `[6, 6, 6]` (px).
   */
  function tickSizes(): [number, number, number];
  /**
   * Sets the tick sizes of all axes to _sizes_ (px).
   *
   * @param _
   */
  function tickSizes(_: number): TernaryPlot;
  /**
   * Sets the axis tick sizes to the specified tick sizes in order `[A, B, C]` and returns the ternary plot.
   * */
  function tickSizes(_: [number, number, number]): TernaryPlot;
  function tickSizes(_?: [number, number, number] | number) {
    return _
      ? Array.isArray(_)
        ? ((A.tickSize = _[0]),
          (B.tickSize = _[1]),
          (C.tickSize = _[2]),
          ternaryPlot)
        : ((A.tickSize = B.tickSize = C.tickSize = +_), ternaryPlot)
      : [A.tickSize, B.tickSize, C.tickSize];
  }

  ternaryPlot.tickSizes = tickSizes;

  /**
   * Returns the current tick sizes, which defaults to `"%"`, meaning ticks are formatted as percentages.
   */
  function setTickFormat(): typeof tickFormat;
  /**
   * Sets the tick format or formatter. _format_ can either be a [format specifier string](https://github.com/d3/d3-format#format) that is passed to [`d3.tickFormat()`](https://github.com/d3/d3-scale/blob/master/README.md#tickFormat).
   * To implement your own tick format function, pass a custom formatter function, for example `const formatTick = (x) => String(x.toFixed(1))`.
   *
   * @param _ - [format specifier string](https://github.com/d3/d3-format#format) or formatter function
   */
  function setTickFormat(_: string | ((tick: number) => string)): TernaryPlot; // this?
  function setTickFormat(_?: any) {
    return _ ? ((tickFormat = _), ternaryPlot) : tickFormat;
  }

  ternaryPlot.tickFormat = setTickFormat;

  /**
   * Returns the current tick text-anchors, which defaults to `["start", "start", "end"]`.
   */
  function tickTextAnchors(): [TextAnchor, TextAnchor, TextAnchor];
  /**
   * Sets the axis tick [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) to the specified text-anchors in order of `[A, B, C]` and returns the ternary plot.
   *
   * @param _ - The tick text anchors per axis in order of `[A, B, C]`
   */
  function tickTextAnchors(
    _: [TextAnchor, TextAnchor, TextAnchor]
  ): TernaryPlot;
  function tickTextAnchors(_?: any) {
    return _
      ? ((A.tickTextAnchor = _[0]),
        (B.tickTextAnchor = _[1]),
        (C.tickTextAnchor = _[2]),
        ternaryPlot)
      : [A.tickTextAnchor, B.tickTextAnchor, C.tickTextAnchor];
  }
  ternaryPlot.tickTextAnchors = tickTextAnchors;

  /**
   * Returns the current labels, which defaults to `[A, B, C]`.
   */
  function labels(): [string, string, string];
  /**
   * If _labels_ is specified, sets the axis labels to the labels in order `[A, B, C]` and returns the ternary plot.
   *
   * @param _ The labels per axis in order of `[A, B, C]`
   */
  function labels(
    _: [string | number, string | number, string | number]
  ): TernaryPlot;
  function labels(_?: [string | number, string | number, string | number]) {
    return _
      ? ((A.label = String(_[0])),
        (B.label = String(_[1])),
        (C.label = String(_[2])),
        ternaryPlot)
      : [A.label, B.label, C.label];
  }
  ternaryPlot.labels = labels;

  /**
   * Returns the current label angles, which defaults to `[0, 60, -60]`
   */
  function labelAngles(): [number, number, number];
  /**
   * Sets the angles of the axis labels to the specified angles in order `[A, B, C]` and returns the ternary plot.
   *
   * @param _ - The label angles per axis in order of `[A, B, C]`
   */
  function labelAngles(_: [number, number, number]): TernaryPlot;
  function labelAngles(_?: [number, number, number]) {
    return _
      ? ((A.labelAngle = _[0]),
        (B.labelAngle = _[1]),
        (C.labelAngle = _[2]),
        ternaryPlot)
      : [A.labelAngle, B.labelAngle, C.labelAngle];
  }
  ternaryPlot.labelAngles = labelAngles;

  /**
   * The label offset is the spacing of the label to the vertex in pixels.
   * Returns the current label offsets, which defaults to `[45, 45, 45]` px.
   */
  function labelOffsets(): [number, number, number];
  /**
   * The label offset is the spacing of the label to the vertex in pixels. Sets the label offsets of all axes to _offsets_.
   *
   * @param _ - The label offsets in px per axis in order of `[A, B, C]`
   */
  function labelOffsets(_: number): TernaryPlot;
  /**
   * The label offset is the spacing of the label to the vertex in pixels. If _offsets_ is specified and is an array,
   * sets the axis label offsets to the specified angles in order of `[A, B, C]` and returns the ternary plot.
   *
   * @param _ - A label offset in px
   */
  function labelOffsets(_: [number, number, number]): TernaryPlot;
  function labelOffsets(_?: number | [number, number, number]) {
    return _
      ? Array.isArray(_)
        ? ((A.labelOffset = _[0]),
          (B.labelOffset = _[1]),
          (C.labelOffset = _[2]),
          ternaryPlot)
        : ((A.labelOffset = B.labelOffset = C.labelOffset = +_), ternaryPlot)
      : [A.labelOffset, B.labelOffset, C.labelOffset];
  }
  ternaryPlot.labelOffsets = labelOffsets;

  /**
   * Returns an [SVG path command](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) for a the outer triangle.
   * This is used for the bounds of the ternary plot and its [clipPath](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath).
   */
  ternaryPlot.triangle = function () {
    // TODO: use d3-path or d3-line for canvas support
    return `M${svA}L${svB}L${svC}Z`;
  };

  /**
   * Returns the current radius, which defaults to 300 (px).
   */
  function setRadius(): number;
  /**
   * Sets the radius of the ternary plot to the specified number.
   *
   * @param _ - The plot radius in px
   */
  function setRadius(_: number): TernaryPlot;
  function setRadius(_?: number) {
    if (typeof _ === "undefined") return radius;

    radius = +_;

    [svA, svB, svC] = ternaryPlot.vertices(); // scaled vertices for drawing gridlines and axis labels

    // 🤔💭 Make a function for setting gridlines?
    A.gridLine = lineBetween(svC, svA);
    B.gridLine = lineBetween(svA, svB);
    C.gridLine = lineBetween(svB, svC);

    return ternaryPlot;
  }
  ternaryPlot.radius = setRadius;

  /**
   * Returns the current scale factor, which defaults to `1`.
   *
   * The scale factor corresponds inversely to the domain length.
   * For example a domains of `[[0, 0.5], [0, 0.5], [0.5, 1]` corresponds to a scale of 2.
   */
  function setScale(): number;
  /**
   * If _scale_ is specified, sets the plot’s scale factor to the specified value, applies the transform and returns the plot.
   *
   * The scale factor corresponds inversely to the domain length. For example a domains of
   * `[[0, 0.5], [0, 0.5], [0.5, 1]` corresponds to a scale of 2.
   *
   * @param _ - The plot scale factor
   */
  function setScale(_: number): TernaryPlot;
  function setScale(_?: number) {
    return _ ? ((k = +_), ternaryPlot.transform(), ternaryPlot) : k;
  }
  ternaryPlot.scale = setScale;

  /**
   * Returns the current translation offset which defaults to `[0, 0]`.
   *
   * Note when setting the translation, the translation offsets are not scaled by the plot radius.
   */
  function setTranslate(): [number, number];
  /**
   * If translate is specified, sets the plot’s translation offset to the specified two-element array
   * `[tx, ty]`. Note that these are **unscaled by the radius**. Then it applies the transform and returns
   * the ternary plot.
   *
   * Note when setting the translation, the offsets **should not** be scaled by the plot radius.
   *
   * @param _ - The plot translation (not scaled by radius)
   */
  function setTranslate(_: [number, number]): TernaryPlot;
  function setTranslate(_?: [number, number]) {
    return _
      ? ((tx = _[0]), (ty = _[1]), ternaryPlot.transform(), ternaryPlot)
      : [tx, ty];
  }
  ternaryPlot.translate = setTranslate;

  /**
   * Computes ternary values from `[x, y]` coordinates that are scaled by the radius.
   * Unlike the _barycentric_.[invert()](#barycentricInvertDoc) method this method takes
   * the plot radius into account. Note that for inverting mouse positions, the ternary plot
   * should centered at the origin of the containing SVG element.
   *
   * @param _ - Array of ternary values
   * @returns [x, y]
   */
  ternaryPlot.invert = function (_: Coord): [number, number, number] {
    const xy: Coord = [_[0] / radius, _[1] / radius];
    const inverted = barycentric.invert(xy);

    return inverted;
  };

  // apply scale and translate to vertices
  /**
   * Applies the plot's scale factor and translations to the plots *barycentric()* conversion function.
   * Or more simply, calling this method moves and scales the triangle defined by *barycentric()* used
   * to calculate the ternary values.
   * Before scale and translation are applied, they are checked if they are within bounds, if not,
   * a correction is applied such that they are within bounds. Finally, the ternary plot is returned.
   *
   * @returns ternaryPlot
   */
  ternaryPlot.transform = function () {
    if (k === 1) {
      tx = 0;
      ty = 0;
      return ternaryPlot;
    }

    const [vA, vB, vC] = unscaledVertices; // copy old unscaled vertices
    const [newvA, newvB, _newvC] = unscaledVertices.map(
      ([vx, vy]: Coord): Coord => [vx * k + tx, vy * k + ty]
    ); // these are the newly transformed vertices BEFORE checking if they within bounds of original triangle

    // slopes of triangle sides
    const mAB = getSlope(vA, vB), // In case of equilateral triangle: sqrt(3) = 1.732
      mAC = getSlope(vA, vC), // In case of equilateral triangle: -sqrt(3) = -1.732
      mBC = getSlope(vB, vC); // In case of equilateral triangle: 0

    // y-intercepts of zoomed triangle sides
    const bAB = newvA[1] - mAB * newvA[0],
      bAC = newvA[1] - mAC * newvA[0],
      bBC = newvB[1] - mBC * newvB[0]; // or newvC[0]

    const lineDistanceAC = parallelLinesDistance(vA[1], bAC, mAC),
      lineDistanceAB = reverse // don't like this solution
        ? parallelLinesDistance(vB[1], bAB, mAB)
        : parallelLinesDistance(vA[1], bAB, mAB),
      lineDistanceBC = parallelLinesDistance(vB[1], bBC, mBC);

    if (lineDistanceAB < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mAB,
        lineDistanceAB
      );

      tx += correctionX;
      ty += correctionY;
    }

    if (lineDistanceAC < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mAC,
        lineDistanceAC
      );

      tx += correctionX;
      ty += correctionY;
    }

    if (lineDistanceBC < -epsilon) {
      const [correctionX, correctionY] = getTranslateCorrections(
        mBC,
        lineDistanceBC
      );

      tx += correctionX;
      ty += correctionY;
    }

    const [uvA, uvB, uvC] = unscaledVertices;

    const scaleAndTranslateVertex = ([vx, vy]: Coord): Coord => [
      vx * k + tx,
      vy * k + ty,
    ];

    // typescript tuples need exact nr of elements which makes using Array.map() a pain ¯\_(ツ)_/¯
    // apply scale & adjusted translations
    const transformedVertices: [Coord, Coord, Coord] = [
      scaleAndTranslateVertex(uvA),
      scaleAndTranslateVertex(uvB),
      scaleAndTranslateVertex(uvC),
    ];

    barycentric.vertices(transformedVertices); // update barycentic coordinates

    return ternaryPlot;
  };

  /**
   * Computes the scale and translation for the given _domains_ and returns a transform object containing
   * scale *k*, and translation offsets *x*, and *y*. This is used to sync the zoom and pan of the plot to
   * the specified domains set by [.domains()](ternaryPlotDomainsDoc). You'll rarely need to call this method directly.

   * Note that the translation returned here is unscaled by radius.

   * @param domains - Array of the plot domains
   */
  ternaryPlot.transformFromDomains = function (domains: Domains) {
    const [domainA, domainB, domainC] = domains;

    const domainLengths = getDomainLengths(domains);
    const domainLength = [...domainLengths][0];

    const [uvA, uvB, uvC] = unscaledVertices;
    const k = 1 / domainLength;

    const domainFromScale = (k: number) => (k - 1) / (k * 3); // find start value of centered, untranslated domain for this scale

    const untranslatedDomainStart = domainFromScale(k);
    // const untranslatedDomain = [domainFromScale(k), 1 - 2 * domainFromScale(k)]

    const shiftA = untranslatedDomainStart - domainA[0],
      shiftB = untranslatedDomainStart - domainB[0],
      shiftC = untranslatedDomainStart - domainC[0];

    const [tx, ty] = [
      uvA[0] * shiftA + uvB[0] * shiftB + uvC[0] * shiftC,
      uvA[1] * shiftA + uvB[1] * shiftB + uvC[1] * shiftC,
    ].map((d) => d * k);

    return { k, x: tx, y: ty };
  };

  /**
   * Computes and returns the domains corresponding to the current transform.
   * This is used for syncing domains while zooming and panning.
   */
  ternaryPlot.domainsFromVertices = function () {
    // 'vertices' is an array the original unscaled, untranslated vertices here
    // find their barycentric values in the transformed barycentric coordinate system
    // assumes barycentic coord system is already transformed
    const [bA, bB, bC] = unscaledVertices.map(barycentric.invert);

    const newADomain = [bB[0], bA[0]].map(insideDomain),
      newBDomain = [bC[1], bB[1]].map(insideDomain),
      newCDomain = [bA[2], bC[2]].map(insideDomain);

    return [newADomain, newBDomain, newCDomain];
  };

  return ternaryPlot;
}
