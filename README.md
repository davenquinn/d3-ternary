# D3 Ternary Plot

[![npm version](https://badge.fury.io/js/d3-ternary.svg)](https://www.npmjs.com/package/d3-ternary)

d3-ternary is a JavaScript library and [D3.js](https://d3js.org/) module that makes it easy to create ternary plots, its API exposes configurable functions in the manner of other D3 modules.

Ternary plots are a type of triangular diagram that depict components proportions in three-component systems. Each point in the triangle corresponds to a unique composition of those three components.

Try d3-ternary your browser, [view the introductory notebook on Observable](https://observablehq.com/@julesblm/introducing-d3-ternary?collection=@julesblm/ternary-plots) and see the 'Ternary Plots' [notebook collection](https://observablehq.com/collection/@julesblm/ternary-plots) for examples. Or make ternary plots in the browser on [TernaryPlot.com](https://www.ternaryplot.com) which is built using d3-ternary.

<img alt="Example ternary plot" src="img/demoPlot.png" />

## Installing

If you use npm

```bash
npm install d3-ternary
```

You can also download the [latest release](https://github.com/davenquinn/d3-ternary/releases) on GitHub. For vanilla JS in modern browsers, import d3-ternary from [Skypack](https://www.skypack.dev/):

```html
<script type="module">
  import {
    barycentric,
    ternaryPlot,
  } from "https://cdn.skypack.dev/d3-ternary@2";

  const b = barycentric();
  const t = ternaryPlot(b);
</script>
```

## API Reference

### `barycentric()`

**barycentric**() [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/barycentric.ts#L6)

Constructs a new default ternary converter that converts ternary data to Cartesian coordinates. By default, it makes an equilateral triangle on the unit circle centered at the origin.

[#](#barycentricConvertDoc) _barycentric_(_data_) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/barycentric.ts#L25)

Computes `[x,y]` coordinates from a ternary values (a single three-element array). Note that the [x, y] coordinates here are unscaled (radius of 1). All values are [normalized](#barycentricNormalizeDoc) by default.

[#](#barycentricInvertDoc) _barycentric_.**invert**(_coordinates_) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/barycentric.ts#L35)

Computes ternary values from coordinates (a two-element array `[x, y]`). Note that the `[x, y]` coordinates here are unscaled i.e. a radius of 1.

[#](#barycentricADoc) _barycentric_.**a**([_a_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/barycentric.ts#L56)

If **a** is specified, sets the a-accessor to the specified function and returns this barycentric converter. If _a_ is not specified, returns the current a-value accessor, which defaults to:

```javascript
const a = (d) => d[0];
```

[#](#barycentricBDoc) _barycentric_.**b**([_b_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/barycentric.ts#L60)

If **b** is specified, sets the b-accessor to the specified function and returns this barycentric converter. If _b_ is not specified, returns the current b-value accessor, which defaults to:

```javascript
const b = (d) => d[1];
```

[#](#barycentricCDoc) _barycentric_.**c**([_c_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/barycentric.ts#L64)

If _c_ is specified, sets the c-accessor to the specified function and returns this barycentric converter. If _c_ is not specified, returns the current c-value accessor, which defaults to:

```javascript
const c = (d) => d[2];
```

[#](#barycentricDomainsDoc) _barycentric_.**domains**([_domains_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/barycentric.ts#L120)

If _domains_ is specified, sets the domains for each axis to the specified domains in order of `[A, B, C]` and returns this barycentric converter. Each domain should be a two-element array `[min, max]`. All domains must have equal lengths. This method allows you to create "partial" ternary plots that zoom in on a specific region of the full triangle.
For example, setting domains to `[[0.2, 0.4], [0.3, 0.5], [0.2, 0.4]]` would show only the portion of the triangle where A is between 20-40%, B between 30-50%, and C between 20-40%.

If _domains_ is not specified, returns the current domains for each axis.

```javascript
// Create a zoomed ternary plot showing only values where
// each component is between 20% and 40%
barycentric.domains([
  [0.2, 0.4], // A axis
  [0.2, 0.4], // B axis
  [0.2, 0.4], // C axis
]);
```

[#](#barycentricScalesDoc) _barycentric_.**scales**() [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/barycentric.ts#L146)

Returns an array of the three [d3.scaleLinear()](https://github.com/d3/d3-scale#scaleLinear) scale functions used internally by the barycentric converter, in order of `[A, B, C]`. These scale functions map the input domains to normalized values between 0 and 1.

### `ternaryPlot()`

**ternaryPlot**(_barycentric_) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts)

Constructs a new default ternary plot generator with the default options.

[#](#ternaryPlotConvertDoc) _ternaryPlot_(_data_) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L359)

Computes `[x, y]` coordinates that are scaled by the plot radius from ternary data. Unlike the [_barycentric_](#barycentricConvertDoc) method, this method takes the plot radius into account.

[#](#ternaryPlotInvertDoc) _ternaryPlot_.**invert**(_coordinates_) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L365)

Computes ternary values from `[x, y]` coordinates that are scaled by the radius. Unlike the _barycentric_.[invert()](#barycentricInvertDoc) method this method takes the plot radius into account. Note that for inverting mouse positions, the ternary plot should centered at the origin of the containing SVG element.

#### Configuration methods

[#](#ternaryPlotRadiusDoc) _ternaryPlot_.**radius**([_radius_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L330)

If _radius_ is specified, sets the radius of the ternary plot to the specified number. If _radius_ is not specified, returns the current radius, which defaults to 300 (px).

To set domains without these extra checks, use _ternaryPlot_.[setDomains(_domains_)](#ternaryPlotSetDomains).

[#](#ternaryPlotVerticesDoc) _ternaryPlot_.**vertices**([_vertices_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L112)

If _vertices_ is specified, unscales _vertices_ and sets the vertices of the _barycentric()_ function passed to _ternaryPlot()_. If _vertices_ is not specified, return the current scaled vertices.

#### Layout methods

[#](#ternaryPlotLabelsDoc) _ternaryPlot_.**labels**([_labels_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L426)

If _labels_ is specified, sets the axis labels to the labels in order of `[A, B, C]` and returns the ternary plot. If _labels_ is not specified, returns the current labels, which defaults to `[`[A, B, C]`]`.

[#](#ternaryPlotLabelAnglesDoc) _ternaryPlot_.**labelAngles**([_angles_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L488)

If _angles_ is specified, sets the angles of the axis labels to the specified angles in order of `[A, B, C]` and returns the ternary plot. If _angles_ is not specified, returns the current label angles, which defaults to `[0, 60, -60]`

[#](#ternaryPlotLabelOffsetsDoc) _ternaryPlot_.**labelOffsets**([_offsets_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L469)

The label offset is the spacing of the label to the vertex in pixels. If _offsets_ is specified and is an array, sets the axis label offsets to the specified angles in order of `[A, B, C]` and returns the ternary plot. If _offsets_ is a number, sets the label offsets of all axes to _offsets_. If _offsets_ is not specified, returns the current label offsets, which defaults to `[45, 45, 45]` px.

[#](#ternaryPlotTickAnglesDoc) _ternaryPlot_.**tickAngles**([_angles_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#256)

If _angles_ is specified, sets the angle of the ticks of each axis to the specified angles in order `[A, B, C]` and returns the ternary plot. If _angles_ is not specified, returns the current tick angles, which defaults to `[0, 60, -60]`.

[#](#ternaryPlotTickAnchorsDoc) _ternaryPlot_.**tickTextAnchors**([_textAnchors_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#410)

If _textAnchors_ is specified, sets the axis tick [text-anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor) to the specified text-anchors in order of `[A, B, C]` and returns the ternary plot. If _textAnchors_ is not specified, returns the current tick text-anchors, which defaults to `["start", "start", "end"]`.

[#](#ternaryPlotTickSizesDoc) _ternaryPlot_.**tickSizes**([_sizes_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#370)

If _sizes_ is specified and is an array, sets the axis tick sizes to the specified tick sizes in order of `[A, B, C]` and returns the ternary plot. If _sizes_ is a number, sets the tick sizes of all axes to _sizes_. If _sizes_ is not specified, returns the current tick sizes, which defaults to `[6, 6, 6]` (px).

[#](#ternaryPlotTickFormatDoc) _ternaryPlot_.**tickFormat**([_format_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#387)

If _format_ is specified, sets the tick format. _format_ can either be a [format specifier string](https://github.com/d3/d3-format#format) that is passed to [`d3.tickFormat()`](https://github.com/d3/d3-scale/blob/master/README.md#tickFormat). To implement your own tick format function, pass a custom formatter function, for example `const formatTick = (x) => String(x.toFixed(1))`. If _format_ is not specified, returns the current tick sizes, which defaults to `"%"`, meaning ticks are formatted as percentages.

#### Plot Methods

[#](#ternaryPlotGridLinesDoc) _ternaryPlot_.**gridLines**([_count_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L69)

Generates and returns an array of arrays containing grid line coordinates for each axis. If _count_ is not specified, it defaults to 10. _count_ can be a number or an array of numbers, one for each axis in order of `[A, B, C]`. Each array contains _count_ elements of two-element arrays with the start- and end coordinates of the grid line.

Grid lines are generated using [d3._scaleLinear_.ticks()](https://d3js.org/d3-scale/linear#linear_ticks). The specified count is only a **hint**; the scale may return more or fewer values depending on the domain.

[#](#ternaryPlotTicksDoc) _ternaryPlot_.**ticks**([_count_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L158)

Generates and returns an array of tick objects for each axis. If _count_ is not specified, it defaults to 10. _count_ can be a number or an array of numbers, one for each axis in order of `[A, B, C]`.

Each tick object contains:

- `tick`: The formatted tick text
- `position`: An array of [x,y] coordinates
- `angle`: The tick rotation angle
- `textAnchor`: The SVG text-anchor value
- `size`: The length of the tick line

Ticks are generated using [d3._scaleLinear_.ticks()](https://d3js.org/d3-scale/linear#linear_ticks). The specified count is only a **hint**; the scale may return more or fewer values depending on the domain.

[#](#ternaryPlotAxisLabelsDoc) _ternaryPlot_.**axisLabels**([_options_]) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L119)

Generates and returns an array containing axis label objects. Each axis label object contains:

- `position`: An array of `[x,y]` coordinates
- `angle`: The rotation angle of the label
- `label`: The axis label text

Takes an optional configuration object:

```javascript
{
  center: false; // If true, places labels at center of axes instead of vertices
}
```

[#](#ternaryPlotTriangleDoc) _ternaryPlot_.**triangle**() [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/ternaryPlot.ts#L330)

Returns an [SVG path command](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d) for a the outer triangle. This is used for the bounds of the ternary plot and its [clipPath](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/clipPath).

### Transform Functions

[#](#domainsFromTransformDoc) **domainsFromTransform**(_transform_) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/transform.ts#L16)

Converts a transform into domain ranges for the ternary plot axes. This can be used to handle zooming and panning using [d3-zoom](https://d3js.org/d3-zoom). The transform object contains

- `k`: The zoom scale factor (1 = no zoom, >1 = zoomed in)
- `x`: The x-translation
- `y`: The y-translation

Returns an array of `[start, end]` domain ranges for axes A, B, and C. For example:

```javascript
const transform = { k: 1.4285, x: -0.3711, y: -0.2142; }
const domains = domainsFromTransform(transform);
// Returns :
// [
//   [0, 0.7],
//   [0, 0.7],
//   [0.3, 1],
// ]
```

Throws an error if the transform would create invalid domains (outside the [0,1] range) or if trying to zoom out beyond the original triangle.

[#](#transformFromDomainsDoc) **transformFromDomains**(_domains_) [<>](https://github.com/davenquinn/d3-ternary/blob/master/src/transform.ts#L89)

The inverse of domainsFromTransform - converts domain ranges into a d3.zoom transform. This is useful when you want to programmatically set the zoom/pan state to focus on specific domain ranges.

Takes an array of `[start, end]` domain ranges for axes A, B, and C. Returns a transform object with:

- `k`: The zoom scale factor
- `x`: The x-translation (unscaled by radius)
- `y`: The y-translation (unscaled by radius)

Example usage:

```javascript
// Zoom in to show only values where each component is between 20-70%
const partialDomains = [
  [0, 0.7],
  [0, 0.7],
  [0.3, 1],
];

const b = barycentric().domains(partialDomains);

const { x, y, k } = transformFromDomains(b.domains());

// We need to sync d3-zoom with the tranform of the partial domains
const initialTransform = d3.zoomIdentity
  .translate(x * radius, y * radius)
  .scale(k);

chart.call(zoom).call(zoom.transform, initialTransform);
```

Note that the translations returned are unscaled by the plot radius - they should be scaled by the radius before being used with SVG transforms.

## Acknowledgments

Several projects have served as a starting point for this module.

- The initial [d3-ternary](https://github.com/davenquinn/d3-ternary) module by [Daven Quinn](https://github.com/davenquinn/)
- [Ternary slider](https://observablehq.com/@yurivish/ternary-slider) notebook by Yuri Vishnevsky
- [D3 Ternary Plot](https://observablehq.com/@toja/d3-ternary-plot) notebook by Torben Jansen
- [Zoomable Ternary Plot](https://observablehq.com/@dixonj13/zoomable-ternary-plot) notebook by dixonj13

All authors are thanked.
