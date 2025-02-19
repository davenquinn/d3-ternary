# React

This document demonstrates how to render a ternary plot using React components. The code below shows how to create a reusable `<TernaryPlot/>` component that wraps the d3-ternary functionality.

```jsx
import { barycentric, ternaryPlot } from "d3-ternary";

function TernaryPlot({
  radius,
  labels,
  domains,
  tickTextAnchors,
  tickAngles,
  tickCounts,
  tickSizes,
  gridLineCounts,
  labelAngles,
  labelOffsets,
}) {
  const b = barycentric().domains(domains);

  const t = ternaryPlot(b)
    .radius(radius)
    .labels(labels)
    .tickAngles(tickAngles)
    .tickTextAnchors(tickTextAnchors)
    .tickSizes(tickSizes)
    .labelAngles(labelAngles)
    .labelOffsets(labelOffsets)

  const axisLabels = t.axisLabels();
  const gridLines = t.gridLines(gridLineCounts);
  const ticks = t.ticks(tickCounts);
  const trianglePath = t.triangle();

  return (
    <svg height={width} width={width}>
      <g transform={`translate(${width / 2} ${width / 2})`}>
        <AxisLabels axisLabels={axisLabels} />

        <GridLines gridLines={gridLines} />

        <AxisTicks ticks={ticks} />

        <path d={trianglePath} stroke="black" fill="none" id="triangle" />

        <g name="data" clipPath="url(#triangle)">
          <Points plot={plot} />
        </g>
      </g>
    </svg>
  );
}
```

## Ticks

```jsx
import { line } from "d3-shape";

function Tick({ tick, angle, textAnchor, size, position }) {
  return (
    <g name="tick" transform={`translate(${position})`}>
      <text
        textAnchor={textAnchor}
        transform={`rotate(${angle})`}
        dx={(-size - 5) * (textAnchor === "start" ? -1 : 1)}
        dy={".3em"}
      >
        {tick}
      </text>
      <line
        transform={`rotate(${angle + 90})`}
        y2={size * (textAnchor === "start" ? -1 : 1)}
        stroke="grey"
      />
    </g>
  );
}

function AxisTicks({ ticks }) {
  return (
    <g name="ternary-ticks" fontSize="10">
      {ticks.map((axisTicks, i) => (
        <g name="axis-ticks" key={i}>
          {axisTicks.map((d) => (
            <Tick key={d.tick + d.angle} {...d} />
          ))}
        </g>
      ))}
    </g>
  );
}
```

## Axis Labels

```jsx
function AxisLabels({ axisLabels }) {
  return (
    <g name="axis-labels" textAnchor="middle" fontSize={16}>
      {axisLabels.map((d) => (
        <text
          key={d.label + d.angle}
          transform={`translate(${d.position})rotate(${d.angle})`}
          fontSize={d.fontSize}
          alignmentBaseline="middle"
          textAnchor={d.textAnchor}
        >
          {d.label}
        </text>
      ))}
    </g>
  );
}
```

## Grid Lines

```jsx
function GridLines({ gridLines }) {
  const gridLinesPaths = gridLines.map((axisGrid) =>
    axisGrid.map(line()).join(" "),
  );

  return (
    <g name="ternary-gridlines">
      {gridLinesPaths.map((d, i) => (
        <path key={i} d={d} stroke="#e3e3e3" strokeWidth={1} />
      ))}
    </g>
  );
}
```
