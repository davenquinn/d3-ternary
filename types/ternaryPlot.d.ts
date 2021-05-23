import { TernaryPlot, Barycentric, Domains, Coord, TickProps, TextAnchor } from "./types";
export default function ternaryPlot(barycentric: Barycentric): {
    (_: any): Coord;
    vertices: {
        (): [Coord, Coord, Coord];
        (newScaledVertices: [Coord, Coord, Coord]): any;
    };
    /**
     * Generates and return an array containing axis label objects. Each axis label object contains the following properties.
     * - `position`: an array of [x,y] coords
     * - `labelAngle`: the rotation of the axis label
     * - `label`: The axis label
     *
     * Takes an optional configuration object that specifies whether axis labels should be placed at the center of the axis, the default is `false`.
     */
    axisLabels({ center }?: {
        center?: boolean | undefined;
    }): {
        position: number[];
        label: string;
        angle: number;
    }[];
    setDomains(domains: Domains): any;
    reverseVertices(): any;
    domains: {
        (): Domains;
        (domains: Domains): TernaryPlot;
    };
    /**
     * Generates and return an array of arrays containing each grid line objects. If counts is not specified,
     * it defaults to 20. *Counts* can be a number or an array of numbers, one for each axis in order of `[A, B, C]`.
     * Each array contains `counts` elements of two-element arrays with the start- and end coordinates of the grid line in two-element arrays.
     * @param counts
     * @returns
     */
    gridLines(counts?: number): (Coord | undefined)[][][];
    /**
     * Generates and return an array of arrays containing each grid line objects. If counts is not specified
     * it defaults to 20. *Counts* can be a number or an array of numbers, one for each axis in order of `[A, B, C]`.
     * Each array contains `counts` elements of two-element arrays with the start- and end coordinates of the grid line in two-element arrays.
     * @param counts
     * @returns
     */
    ticks(counts?: number): TickProps[][];
    tickAngles: {
        (): [number, number, number];
        (tickAngles: [number, number, number]): TernaryPlot;
    };
    tickSizes: {
        (): [number, number, number];
        (_: number): TernaryPlot;
        (_: [number, number, number]): TernaryPlot;
    };
    tickFormat: {
        (): string | ((tick: number) => string);
        (_: string | ((tick: number) => string)): TernaryPlot;
    };
    tickTextAnchors: {
        (): [TextAnchor, TextAnchor, TextAnchor];
        (_: [TextAnchor, TextAnchor, TextAnchor]): TernaryPlot;
    };
    labels: {
        (): [string, string, string];
        (_: [string | number, string | number, string | number]): TernaryPlot;
    };
    labelAngles: {
        (): [number, number, number];
        (_: [number, number, number]): TernaryPlot;
    };
    labelOffsets: {
        (): [number, number, number];
        (_: number): TernaryPlot;
        (_: [number, number, number]): TernaryPlot;
    };
    /**
     * Returns an [SVG path command](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) for a the outer triangle.
     * This is used for the bounds of the ternary plot and its [clipPath](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath).
     */
    triangle(): string;
    radius: {
        (): number;
        (_: number): TernaryPlot;
    };
    scale: {
        (): number;
        (_: number): TernaryPlot;
    };
    translate: {
        (): [number, number];
        (_: [number, number]): TernaryPlot;
    };
    /**
     * Computes ternary values from `[x, y]` coordinates that are scaled by the radius.
     * Unlike the _barycentric_.[invert()](#barycentricInvertDoc) method this method takes
     * the plot radius into account. Note that for inverting mouse positions, the ternary plot
     * should centered at the origin of the containing SVG element.
     *
     * @param _ - Array of ternary values
     * @returns [x, y]
     */
    invert(_: Coord): [number, number, number];
    /**
     * Applies the plot's scale factor and translations to the plots *barycentric()* conversion function.
     * Or more simply, calling this method moves and scales the triangle defined by *barycentric()* used
     * to calculate the ternary values.
     * Before scale and translation are applied, they are checked if they are within bounds, if not,
     * a correction is applied such that they are within bounds. Finally, the ternary plot is returned.
     *
     * @returns ternaryPlot
     */
    transform(): any;
    /**
     * Computes the scale and translation for the given _domains_ and returns a transform object containing
     * scale *k*, and translation offsets *x*, and *y*. This is used to sync the zoom and pan of the plot to
     * the specified domains set by [.domains()](ternaryPlotDomainsDoc). You'll rarely need to call this method directly.
  
     * Note that the translation returned here is unscaled by radius.
  
     * @param domains - Array of the plot domains
     */
    transformFromDomains(domains: Domains): {
        k: number;
        x: number;
        y: number;
    };
    /**
     * Computes and returns the domains corresponding to the current transform.
     * This is used for syncing domains while zooming and panning.
     */
    domainsFromVertices(): number[][];
};
