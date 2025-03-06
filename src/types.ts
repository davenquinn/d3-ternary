import type { ScaleLinear } from "d3-scale";
export { barycentric } from "./barycentric";

/**
 * Ternary plot generator
 * @public
 */
export interface TernaryPlot {
  /**
   * Converts data to cartesian coordinates using the provided barycentric converter and scaling by radius
   */
  (d: unknown): [x: number, y: number];

  /**
   * Returns an SVG path command for the outer triangle
   * @remarks
   * Generates a path string that can be used with SVG path elements to draw the triangle
   */
  triangle(): string;

  /**
   * Generates and returns an array of arrays containing grid line coordinates for each axis
   * @remarks
   * Takes a number specifying the number of grid lines for all axes.
   * Each array contains the specified number of elements of two-element arrays with the start- and end coordinates of the grid line.
   *
   * Grid lines are generated using [d3.scaleLinear.ticks()](https://d3js.org/d3-scale/linear#linear_ticks).
   * The specified count is only a **hint**; the scale may return more or fewer values depending on the domain.
   */
  gridLines(count: number): GridLines;
  /**
   * Generates and returns an array of arrays containing grid line coordinates for each axis
   * @remarks
   * Takes an array of three numbers `[A, B, C]` specifying the number of grid lines for each axis.
   * Each array contains the specified number of elements of two-element arrays with the start- and end coordinates of the grid line.
   */
  gridLines(count: [number, number, number]): GridLines;

  /**
   * Generates and returns an array containing axis label objects
   * @remarks
   * Each axis label object contains:
   * - `position`: An array of `[x,y]` coordinates
   * - `angle`: The rotation angle of the label
   * - `label`: The axis label text
   * @param options - Configuration options
   * @param options.center - If true, places labels at the center of each axis instead of at vertices
   */
  axisLabels(options?: {
    center?: boolean;
  }): [a: AxisLabel, b: AxisLabel, c: AxisLabel];

  /**
   * Generates and returns an array of tick objects for each axis using the specified count
   * @remarks
   * Each tick object contains:
   * - `tick`: The formatted tick text
   * - `position`: An array of [x,y] coordinates
   * - `angle`: The tick rotation angle
   * - `textAnchor`: The SVG text-anchor value
   * - `size`: The length of the tick line
   *
   * Ticks are generated using [d3.scaleLinear.ticks()](https://d3js.org/d3-scale/linear#linear_ticks).
   * The specified count is only a **hint**; the scale may return more or fewer values depending on the domain.
   * @param count - The approximate number of ticks to generate for each axis
   */
  ticks(count: number): Ticks;
  
  /**
   * Generates and returns an array of tick objects for each axis using different counts per axis
   * @remarks
   * Each tick object contains:
   * - `tick`: The formatted tick text
   * - `position`: An array of [x,y] coordinates
   * - `angle`: The tick rotation angle
   * - `textAnchor`: The SVG text-anchor value
   * - `size`: The length of the tick line
   *
   * Ticks are generated using [d3.scaleLinear.ticks()](https://d3js.org/d3-scale/linear#linear_ticks).
   * The specified counts are only **hints**; the scale may return more or fewer values depending on the domain.
   * @param count - An array of [a,b,c] specifying the approximate number of ticks for each axis
   */
  ticks(count: [a: number, b: number, c: number]): Ticks;

  /**
   * Returns the current tick format, which defaults to `"%"`
   */
  tickFormat(): string | ((d: number) => string);
  /**
   * Sets the tick format and returns the ternary plot
   * @remarks
   * Format can either be a [format specifier string](https://github.com/d3/d3-format#format)
   * that is passed to [d3.tickFormat()](https://github.com/d3/d3-scale/blob/master/README.md#tickFormat),
   * or a custom formatter function.
   */
  tickFormat(format: string | ((d: number) => string)): TernaryPlot;

  /**
   * Returns the current radius, which defaults to 300 (px)
   */
  radius(): number;
  /**
   * Sets the radius of the ternary plot to the specified number and returns the ternary plot
   */
  radius(radius: number): TernaryPlot;

  /**
   * Computes ternary values from `[x, y]` coordinates that are scaled by the radius
   * @remarks
   * Unlike the barycentric.invert() method this method takes the plot radius into account.
   * Note that for inverting mouse positions, the ternary plot should be centered at the origin of the containing SVG element.
   */
  invert(coords: [number, number]): [number, number, number];

  /**
   * Returns the current axis labels, which defaults to `["A", "B", "C"]`
   */
  labels(): [a: string, b: string, c: string];
  /**
   * Sets the axis labels to the specified labels in order of `[A, B, C]` and returns the ternary plot
   */
  labels(labels: [a: string, b: string, c: string]): TernaryPlot;

  /**
   * Returns the current tick angles, which defaults to `[0, 60, -60]`
   */
  tickAngles(): [a: number, b: number, c: number];
  /**
   * Sets the angle of the ticks of each axis to the specified angles in order `[A, B, C]` and returns the ternary plot
   */
  tickAngles(angles: [a: number, b: number, c: number]): TernaryPlot;

  /**
   * Returns the current label angles, which defaults to `[0, 60, -60]`
   */
  labelAngles(): [a: number, b: number, c: number];
  /**
   * Sets the angle of the axis labels to the specified angles in order `[A, B, C]` and returns the ternary plot
   */
  labelAngles(angles: [a: number, b: number, c: number]): TernaryPlot;

  /**
   * Returns the current text anchors, which defaults to `["start", "end", "end"]`
   */
  tickTextAnchors(): [a: TextAnchor, b: TextAnchor, c: TextAnchor];
  /**
   * Sets the text-anchor of the ticks of each axis to the specified values in order `[A, B, C]` and returns the ternary plot
   */
  tickTextAnchors(
    anchors: [a: TextAnchor, b: TextAnchor, c: TextAnchor],
  ): TernaryPlot;

  /**
   * Returns the current tick sizes, which defaults to `[6, 6, 6]` (px)
   */
  tickSizes(): [number, number, number];
  /**
   * Sets the tick sizes of all axes to the specified size (px) and returns the ternary plot
   */
  tickSizes(size: number): TernaryPlot;
  /**
   * Sets the axis tick sizes to the specified tick sizes in order `[A, B, C]` and returns the ternary plot
   */
  tickSizes(sizes: readonly [number, number, number]): TernaryPlot;

  /**
   * Returns the current label offsets, which defaults to `[45, 45, 45]` (px)
   */
  labelOffsets(): [a: number, b: number, c: number];
  /**
   * Sets the label offset of all axes to the specified size (px) and returns the ternary plot
   */
  labelOffsets(offset: number): TernaryPlot;
  /**
   * Sets the label offsets to the specified sizes in order `[A, B, C]` and returns the ternary plot
   */
  labelOffsets(offsets: [a: number, b: number, c: number]): TernaryPlot;
}

export type TextAnchor = "start" | "middle" | "end";

export type AxisLabel = {
  position: [x: number, y: number];
  label: string;
  angle: number;
};

export type Tick = {
  tick: string;
  angle: number;
  textAnchor: string;
  size: number;
  position: [x: number, y: number];
};

export type Ticks = [Array<Tick>, Array<Tick>, Array<Tick>];

export type GridLine = [
  start: [x: number, y: number],
  end: [x: number, y: number],
];

export type GridLines = [Array<GridLine>, Array<GridLine>, Array<GridLine>];

/**
 * Accessor function for getting component values
 * @public
 */
export type Accessor = (d: any) => number;

/**
 * Barycentric coordinate converter
 * @public
 */
export interface Barycentric {
  /**
   * Converts data to cartesian coordinates using the current accessors and scales
   */
  (d: unknown): [x: number, y: number];

  /**
   * Converts raw barycentric coordinates to cartesian coordinates without scaling
   */
  unscaled(d: [number, number, number]): [number, number];

  /**
   * Computes ternary values from coordinates
   * @remarks
   * Converts x,y coordinates back into barycentric coordinates, taking into account any rotation
   */
  invert([x, y]: [number, number]): [number, number, number];

  /**
   * Returns the current accessor function for the A component, which defaults to:
   * ```ts
   * (d) => d[0]
   * ```
   */
  a(fn?: Accessor): Accessor | Barycentric;

  /**
   * Returns the current accessor function for the B component, which defaults to:
   * ```ts
   * (d) => d[1]
   * ```
   */
  b(fn?: Accessor): Accessor | Barycentric;

  /**
   * Returns the current accessor function for the C component, which defaults to:
   * ```ts
   * (d) => d[2]
   * ```
   */
  c(fn?: Accessor): Accessor | Barycentric;

  /**
   * Returns the current rotation angle in degrees, which defaults to 0.
   */
  rotation(): number;
  /**
   * Sets the rotation angle to the specified angle in degrees and returns the barycentric converter.
   * Positive angles rotate the plot clockwise.
   */
  rotation(angle: number): Barycentric;

  /**
   * Returns an array of the current domains.
   * Each domain is a two-element array containing the start and end values, in order of `[A, B, C]`.
   */
  domains(): [[number, number], [number, number], [number, number]];
  /**
   * Sets the domains for each axis and returns the barycentric converter.
   * Each domain is a two-element array containing the start and end values, in order of `[A, B, C]`.
   */
  domains(
    domains: [
      [start: number, end: number],
      [start: number, end: number],
      [start: number, end: number],
    ],
  ): Barycentric;

  /**
   * Returns the scales for the three axes
   * @returns Array of d3 linear scales in order [A, B, C]
   */
  scales(): [
    ScaleLinear<number, number, never>,
    ScaleLinear<number, number, never>,
    ScaleLinear<number, number, never>,
  ];
}
