import { useRef } from "react";

export function TernaryPlot({
  domains,
  gridLineCounts,
  labels,
  labelAngles,
  labelOffsets,
  tickAngles,
  tickCounts,
  tickSizes,
  width,
}) {
  const chartRef = useRef(null);
  const radius = width / 2.1;
  const yOffset = radius / 4;

  const { plot } = useTernaryPlot({
    domains,
    labels,
    labelAngles,
    labelOffsets,
    tickAngles,
    tickSizes,
    radius,
  });

  const axisLabels = plot.axisLabels();
  const gridLines = plot.gridLines(gridLineCounts);
  const ticks = plot.ticks(tickCounts);
  const trianglePath = plot.triangle();

  return (
    <svg
      height={width}
      width={width}
      id="ternary-plot"
      fontFamily="sans-serif"
      className="mx-auto my-0"
    >
      <defs>
        <Arrow width={6} />
        <Arrow id="arrow-reverse" width={6} reverse={true} />
      </defs>

      <desc>A ternary plot made with TernaryPlot.com</desc>
      {isOpaque ? (
        <rect
          fill="white"
          height={width}
          width={width}
          className="white-background"
        />
      ) : null}
      <g
        ref={chartRef}
        transform={`translate(${width / 2} ${width / 1.9 + yOffset})`}
      >
        <clipPath id="triangle-path">
          <path d={trianglePath} />
        </clipPath>
        <AxisLabels axisLabels={axisLabels} />
        <GridLines gridLines={gridLines} />
        <AxisTicks ticks={ticks} />
        <path d={trianglePath} stroke="black" fill="none" id="triangle" />
        <g className="data" clipPath="url(#triangle-path)">
          <Points plot={plot} />
          <Areas plot={plot} />
          <Lines plot={plot} />
          <Text plot={plot} />
        </g>
      </g>
    </svg>
  );
}
