export function TernaryPlot({
  domains,
  gridLineCounts,
  labels,
  labelAngles,
  labelOffsets,
  tickAngles,
  tickCounts,
  tickSizes,
  radius = 300,
  points = [],
  areas = [],
  text = [],
  lines = [],
}) {
  const yOffset = radius / 4;

  const plot = useTernaryPlot({
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
      <desc>A ternary plot made with d3-ternary</desc>
      <g transform={`translate(${width / 2} ${width / 1.9 + yOffset})`}>
        <clipPath id="triangle-path">
          <path d={trianglePath} />
        </clipPath>
        <AxisLabels axisLabels={axisLabels} />
        <GridLines gridLines={gridLines} />
        <AxisTicks ticks={ticks} />
        <path d={trianglePath} stroke="black" fill="none" id="triangle" />
        <g className="data" clipPath="url(#triangle-path)">
          <Points points={points} plot={plot} />
          <Areas areas={areas} plot={plot} />
          <Lines lines={lines} plot={plot} />
          <Text text={text} plot={plot} />
        </g>
      </g>
    </svg>
  );
}
