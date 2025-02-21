import type {
  AxisLabel,
  Barycentric,
  GridLines,
  TernaryPlot,
  TextAnchor,
  Ticks,
} from "./types";

/**
 * Constructs a new ternary plot using the provided barycentric converter
 */
export function ternaryPlot(barycentric: Barycentric) {
  let radius = 300;
  let tickFormat: string | ((d: number) => string) = "%";

  // axes configurations
  const A = {
    label: "A",
    labelAngle: 0,
    labelOffset: 45,
    tickAngle: 0,
    tickSize: 6,
    tickTextAnchor: "start",
  };

  const B = {
    label: "B",
    labelAngle: 60,
    labelOffset: 45,
    tickAngle: 60,
    tickSize: 6,
    tickTextAnchor: "end",
  };

  const C = {
    label: "C",
    labelAngle: -60,
    labelOffset: 45,
    tickAngle: -60,
    tickSize: 6,
    tickTextAnchor: "end",
  };

  /** Transform coordinates only applying radius */
  function transform(x: number, y: number): [x: number, y: number] {
    return [x * radius, y * radius];
  }

  const ternaryPlot = function (d: unknown) {
    const [x, y] = barycentric(d);
    return transform(x, y); // Apply radius
  };

  // Get the three corners of the triangle - using full triangle for display
  function getVertices(): [
    [x: number, y: number],
    [x: number, y: number],
    [x: number, y: number],
  ] {
    const a = transform(...barycentric.unscaled([1, 0, 0]));
    const b = transform(...barycentric.unscaled([0, 1, 0]));
    const c = transform(...barycentric.unscaled([0, 0, 1]));

    return [a, b, c];
  }

  /**
   * Returns an SVG path command for the outer triangle.
   */
  ternaryPlot.triangle = function () {
    const [cA, cB, cC] = getVertices();
    return `M${cA}L${cB}L${cC}Z`;
  };

  /**
   * Generates and returns an array of arrays containing grid line coordinates for each axis.
   * Takes an array of three numbers `[A, B, C]` specifying the number of grid lines for each axis.
   * Each array contains the specified number of elements of two-element arrays with the start- and end coordinates of the grid line.
   *
   * Grid lines are generated using [d3._scaleLinear_.ticks()](https://d3js.org/d3-scale/linear#linear_ticks).
   * The specified counts are only **hints**; the scale may return more or fewer values depending on the domain.
   */
  function gridLines(count: number): GridLines;
  function gridLines(count: [number, number, number]): GridLines;
  function gridLines(count: [number, number, number] | number = 10) {
    const [scaleA, scaleB, scaleC] = barycentric.scales();
    const counts = Array.isArray(count) ? count : [+count, +count, +count];

    const gridLines: GridLines = [
      // A axis grid lines (vertical lines, parallel to BC edge)
      scaleA
        .ticks(counts[0])
        .map((t): [[x: number, y: number], [x: number, y: number]] => {
          const scaledT = scaleA(t);

          const start = transform(
            ...barycentric.unscaled([scaledT, 1 - scaledT, 0]),
          );
          const end = transform(
            ...barycentric.unscaled([scaledT, 0, 1 - scaledT]),
          );

          return [start, end];
        }),
      // B axis grid lines (lines parallel to AC edge, from left vertex)
      scaleB
        .ticks(counts[1])
        .map((t): [[x: number, y: number], [x: number, y: number]] => {
          const scaledT = scaleB(t);

          const start = transform(
            ...barycentric.unscaled([0, scaledT, 1 - scaledT]),
          );
          const end = transform(
            ...barycentric.unscaled([1 - scaledT, scaledT, 0]),
          );

          return [start, end];
        }),
      // C axis grid lines (lines parallel to AB edge, from right vertex)
      scaleC
        .ticks(counts[2])
        .map((t): [[x: number, y: number], [x: number, y: number]] => {
          const scaledT = scaleC(t);

          const start = transform(
            ...barycentric.unscaled([1 - scaledT, 0, scaledT]),
          );
          const end = transform(
            ...barycentric.unscaled([0, 1 - scaledT, scaledT]),
          );

          return [start, end];
        }),
    ];

    return gridLines;
  }

  ternaryPlot.gridLines = gridLines;

  /**
   * Generates and returns an array containing axis label objects. Each axis label object contains:
   *
   * - `position`: An array of `[x,y]` coordinates
   * - `angle`: The rotation angle of the label
   * - `label`: The axis label text
   *
   * Takes an optional configuration object:
   * - `center`: If true, places labels at the center of each axis instead of at vertices
   */
  ternaryPlot.axisLabels = function ({ center = false } = {}): [
    a: AxisLabel,
    b: AxisLabel,
    c: AxisLabel,
  ] {
    const [cA, cB, cC] = getVertices(); // c1=[1,0,0], c2=[0,1,0], c3=[0,0,1]

    if (center) {
      // Calculate midpoints of each edge
      const midAB = [(cA[0] + cB[0]) / 2, (cA[1] + cB[1]) / 2];
      const midBC = [(cB[0] + cC[0]) / 2, (cB[1] + cC[1]) / 2];
      const midCA = [(cC[0] + cA[0]) / 2, (cC[1] + cA[1]) / 2];

      return [
        // C axis label (opposite to C vertex)
        {
          position: [
            (midAB[0] / radius) * (radius + A.labelOffset),
            (midAB[1] / radius) * (radius + A.labelOffset),
          ],
          label: A.label,
          angle: A.labelAngle,
        },
        // A axis label (opposite to A vertex)
        {
          position: [
            (midBC[0] / radius) * (radius + B.labelOffset),
            (midBC[1] / radius) * (radius + B.labelOffset),
          ],
          label: B.label,
          angle: B.labelAngle,
        },
        // B axis label (opposite to B vertex)
        {
          position: [
            (midCA[0] / radius) * (radius + C.labelOffset),
            (midCA[1] / radius) * (radius + C.labelOffset),
          ],
          label: C.label,
          angle: C.labelAngle,
        },
      ];
    }

    // Original vertex-based label positioning
    return [
      // A axis label (at top vertex where A=1)
      {
        position: [
          cA[0] + cA[0] * (A.labelOffset / radius),
          cA[1] + cA[1] * (A.labelOffset / radius),
        ],
        label: A.label,
        angle: A.labelAngle,
      },
      // B axis label (at left vertex where B=1)
      {
        position: [
          cB[0] + cB[0] * (B.labelOffset / radius),
          cB[1] + cB[1] * (B.labelOffset / radius),
        ],
        label: B.label,
        angle: B.labelAngle,
      },
      // C axis label (at right vertex where C=1)
      {
        position: [
          cC[0] + cC[0] * (C.labelOffset / radius),
          cC[1] + cC[1] * (C.labelOffset / radius),
        ],
        label: C.label,
        angle: C.labelAngle,
      },
    ];
  };

  /**
   * Generates and returns an array of tick objects for each axis.
   * If _count_ is not specified, it defaults to 10. _count_ can be a number or an array of three numbers, one for each axis in order of `[A, B, C]`.
   *
   * Each tick object contains:
   *
   * - `tick`: The formatted tick text
   * - `position`: An array of [x,y] coordinates
   * - `angle`: The tick rotation angle
   * - `textAnchor`: The SVG text-anchor value
   * - `size`: The length of the tick line
   *
   * Ticks are generated using [d3._scaleLinear_.ticks()](https://d3js.org/d3-scale/linear#linear_ticks).
   * The specified count is only a **hint**; the scale may return more or fewer values depending on the domain.
   */
  function ticks(count: number): Ticks;
  function ticks(count: [a: number, b: number, c: number]): Ticks;
  function ticks(
    count: [a: number, b: number, c: number] | number = 10,
  ): Ticks {
    const [scaleA, scaleB, scaleC] = barycentric.scales();

    const counts = Array.isArray(count) ? count : [+count, +count, +count];

    const formatA =
      typeof tickFormat === "function"
        ? tickFormat
        : scaleA.tickFormat(counts[0], tickFormat);

    const formatB =
      typeof tickFormat === "function"
        ? tickFormat
        : scaleB.tickFormat(counts[1], tickFormat);

    const formatC =
      typeof tickFormat === "function"
        ? tickFormat
        : scaleC.tickFormat(counts[2], tickFormat);

    const ticks: Ticks = [
      // A axis ticks (top)
      scaleA.ticks(counts[0]).map((t) => {
        const scaledT = scaleA(t);

        return {
          tick: formatA(t),
          angle: A.tickAngle,
          textAnchor: A.tickTextAnchor,
          size: A.tickSize,
          position: transform(
            ...barycentric.unscaled([
              scaledT, // A
              0, // B
              1 - scaledT, // C
            ]),
          ),
        };
      }),
      // B axis ticks (left side)
      scaleB.ticks(counts[1]).map((t) => {
        const scaledT = scaleB(t);

        return {
          tick: formatB(t),
          angle: B.tickAngle,
          textAnchor: B.tickTextAnchor,
          size: B.tickSize,
          position: transform(
            ...barycentric.unscaled([
              1 - scaledT, // A
              scaledT, // B,
              0, // C
            ]),
          ),
        };
      }),
      // C axis ticks (right side)
      scaleC.ticks(counts[2]).map((t) => {
        const scaledT = scaleC(t);

        return {
          tick: formatC(t),
          angle: C.tickAngle,
          textAnchor: C.tickTextAnchor,
          size: C.tickSize,
          position: transform(
            ...barycentric.unscaled([
              0, // A
              1 - scaledT, // B
              scaledT, //C
            ]),
          ),
        };
      }),
    ];

    return ticks;
  }
  ternaryPlot.ticks = ticks;

  /**
   * Returns the current tick format, which defaults to `"%"`.
   */
  function tickFormatFn(): string | ((d: number) => string);
  /**
   * Sets the tick format and returns the ternary plot. _format_ can either be a [format specifier string](https://github.com/d3/d3-format#format)
   * that is passed to [`d3.tickFormat()`](https://github.com/d3/d3-scale/blob/master/README.md#tickFormat),
   * or a custom formatter function, for example `const formatTick = (x) => String(x.toFixed(1))`.
   */
  function tickFormatFn(_: string | ((d: number) => string)): TernaryPlot;
  function tickFormatFn(_?: string | ((d: number) => string)) {
    if (!arguments.length) return tickFormat;
    tickFormat = _ ?? "%";
    return ternaryPlot;
  }
  ternaryPlot.tickFormat = tickFormatFn;

  /**
   * Returns the current radius, which defaults to 300 (px).
   */
  function radiusFn(): number;
  /**
   * Sets the radius of the ternary plot to the specified number and returns the ternary plot.
   */
  function radiusFn(_: number): TernaryPlot;
  function radiusFn(_?: number) {
    if (typeof _ === "undefined") return radius;
    radius = +_;
    return ternaryPlot;
  }
  ternaryPlot.radius = radiusFn;

  /**
   * Computes ternary values from `[x, y]` coordinates that are scaled by the radius.
   * Unlike the _barycentric_.[invert()](#barycentricInvertDoc) method this method takes the plot radius into account.
   * Note that for inverting mouse positions, the ternary plot should centered at the origin of the containing SVG element.
   */
  ternaryPlot.invert = function (_: [number, number]) {
    return barycentric.invert([_[0] / radius, _[1] / radius]);
  };

  /**
   * Returns the current axis labels, which defaults to `["A", "B", "C"]`.
   */
  function labels(): [a: string, b: string, c: string];
  /**
   * Sets the axis labels to the specified labels in order of `[A, B, C]` and returns the ternary plot.
   */
  function labels(_: [a: string, b: string, c: string]): TernaryPlot;
  function labels(_?: [a: string, b: string, c: string]) {
    return _
      ? ((A.label = String(_[0])),
        (B.label = String(_[1])),
        (C.label = String(_[2])),
        ternaryPlot)
      : [A.label, B.label, C.label];
  }
  ternaryPlot.labels = labels;

  /**
   * Returns the current tick angles, which defaults to `[0, 60, -60]`.
   */
  function tickAngles(): [a: number, b: number, c: number];
  /**
   * Sets the angle of the ticks of each axis to the specified angles in order `[A, B, C]` and returns the ternary plot.
   */
  function tickAngles(_: [a: number, b: number, c: number]): TernaryPlot;
  function tickAngles(_?: [number, number, number]) {
    return _
      ? ((A.tickAngle = _[0]),
        (B.tickAngle = _[1]),
        (C.tickAngle = _[2]),
        ternaryPlot)
      : [A.tickAngle, B.tickAngle, C.tickAngle];
  }
  ternaryPlot.tickAngles = tickAngles;

  /**
   * Returns the current label angles, which defaults to `[0, 60, -60]`.
   */
  function labelAngles(): [a: number, b: number, c: number];
  /**
   * Sets the angle of the axis labels to the specified angles in order `[A, B, C]` and returns the ternary plot.
   */
  function labelAngles(_: [a: number, b: number, c: number]): TernaryPlot;
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
   * Returns the current text anchors, which defaults to `["start", "end", "end"]`.
   */
  function tickTextAnchors(): [a: TextAnchor, b: TextAnchor, c: TextAnchor];
  /**
   * Sets the text-anchor of the ticks of each axis to the specified values in order `[A, B, C]` and returns the ternary plot.
   */
  function tickTextAnchors(
    _: [a: TextAnchor, b: TextAnchor, c: TextAnchor],
  ): TernaryPlot;
  function tickTextAnchors(_?: [TextAnchor, TextAnchor, TextAnchor]) {
    return _
      ? ((A.tickTextAnchor = _[0]),
        (B.tickTextAnchor = _[1]),
        (C.tickTextAnchor = _[2]),
        ternaryPlot)
      : [A.tickTextAnchor, B.tickTextAnchor, C.tickTextAnchor];
  }
  ternaryPlot.tickTextAnchors = tickTextAnchors;

  /**
   * Returns the current tick sizes, which defaults to `[6, 6, 6]` (px).
   */
  function tickSizes(): [number, number, number];
  /**
   * Sets the tick sizes of all axes to _sizes_ (px).
   */
  function tickSizes(_: number): TernaryPlot;
  /**
   * Sets the axis tick sizes to the specified tick sizes in order `[A, B, C]` and returns the ternary plot.
   */
  function tickSizes(_: readonly [number, number, number]): TernaryPlot;
  function tickSizes(_?: readonly [number, number, number] | number) {
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
   * Returns the current labelOffsets, which defaults to `[45, 45, 45]` (px).
   */
  function labelOffsets(): [a: number, b: number, c: number];
  /**
   * Sets the label offsets to the specified sizes in order `[A, B, C]` and returns the ternary plot.
   */
  function labelOffsets(_: [a: number, b: number, c: number]): TernaryPlot;
  /**
   * Sets the label offset of all axes to the specified size (px) and returns the ternary plot.
   */
  function labelOffsets(_: number): TernaryPlot;
  function labelOffsets(_?: number | [a: number, b: number, c: number]) {
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

  return ternaryPlot;
}
