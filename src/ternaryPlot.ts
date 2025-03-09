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
export function ternaryPlot<T = [number, number, number]>(
  barycentric: Barycentric<T>,
) {
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

  const ternaryPlot: TernaryPlot<T> = function (d: T) {
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

  ternaryPlot.triangle = function () {
    const [cA, cB, cC] = getVertices();
    return `M${cA}L${cB}L${cC}Z`;
  };

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

  function tickFormatFn(): string | ((d: number) => string);
  function tickFormatFn(_: string | ((d: number) => string)): TernaryPlot<T>;
  function tickFormatFn(_?: string | ((d: number) => string)) {
    if (!arguments.length) return tickFormat;
    tickFormat = _ ?? "%";
    return ternaryPlot;
  }
  ternaryPlot.tickFormat = tickFormatFn;

  function radiusFn(): number;
  function radiusFn(_: number): TernaryPlot<T>;
  function radiusFn(_?: number) {
    if (typeof _ === "undefined") return radius;
    radius = +_;
    return ternaryPlot;
  }
  ternaryPlot.radius = radiusFn;

  ternaryPlot.invert = function (_: [number, number]) {
    return barycentric.invert([_[0] / radius, _[1] / radius]);
  };

  function labels(): [a: string, b: string, c: string];
  function labels(_: [a: string, b: string, c: string]): TernaryPlot<T>;
  function labels(_?: [a: string, b: string, c: string]) {
    return _
      ? ((A.label = String(_[0])),
        (B.label = String(_[1])),
        (C.label = String(_[2])),
        ternaryPlot)
      : [A.label, B.label, C.label];
  }
  ternaryPlot.labels = labels;

  function tickAngles(): [a: number, b: number, c: number];
  function tickAngles(_: [a: number, b: number, c: number]): TernaryPlot<T>;
  function tickAngles(_?: [number, number, number]) {
    return _
      ? ((A.tickAngle = _[0]),
        (B.tickAngle = _[1]),
        (C.tickAngle = _[2]),
        ternaryPlot)
      : [A.tickAngle, B.tickAngle, C.tickAngle];
  }
  ternaryPlot.tickAngles = tickAngles;

  function labelAngles(): [a: number, b: number, c: number];

  function labelAngles(_: [a: number, b: number, c: number]): TernaryPlot<T>;
  function labelAngles(_?: [number, number, number]) {
    return _
      ? ((A.labelAngle = _[0]),
        (B.labelAngle = _[1]),
        (C.labelAngle = _[2]),
        ternaryPlot)
      : [A.labelAngle, B.labelAngle, C.labelAngle];
  }
  ternaryPlot.labelAngles = labelAngles;

  function tickTextAnchors(): [a: TextAnchor, b: TextAnchor, c: TextAnchor];
  function tickTextAnchors(
    _: [a: TextAnchor, b: TextAnchor, c: TextAnchor],
  ): TernaryPlot<T>;
  function tickTextAnchors(_?: [TextAnchor, TextAnchor, TextAnchor]) {
    return _
      ? ((A.tickTextAnchor = _[0]),
        (B.tickTextAnchor = _[1]),
        (C.tickTextAnchor = _[2]),
        ternaryPlot)
      : [A.tickTextAnchor, B.tickTextAnchor, C.tickTextAnchor];
  }
  ternaryPlot.tickTextAnchors = tickTextAnchors;

  function tickSizes(): [number, number, number];
  function tickSizes(_: number): TernaryPlot<T>;
  function tickSizes(_: readonly [number, number, number]): TernaryPlot<T>;
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

  function labelOffsets(): [a: number, b: number, c: number];
  function labelOffsets(_: [a: number, b: number, c: number]): TernaryPlot<T>;
  function labelOffsets(_: number): TernaryPlot<T>;
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
