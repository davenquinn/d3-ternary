import { line } from "d3-shape";

function Tick({ tick, angle, textAnchor, size, position }) {
  return (
    <g className="tick" transform={`translate(${position})`}>
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

export function AxisLabels({ axisLabels }) {
  return (
    <g className="axis-labels" textAnchor="middle" fontSize={16}>
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

export function GridLines({ gridLines }) {
  const gridLinesPaths = gridLines.map((axisGrid) =>
    axisGrid.map(line()).join(" ")
  );

  return (
    <g className="ternary-gridlines">
      {gridLinesPaths.map((d, i) => (
        <path key={i} d={d} stroke="#e3e3e3" strokeWidth={1} />
      ))}
    </g>
  );
}

export function AxisTicks({ ticks }) {
  return (
    <g className="ternary-ticks" fontSize="10">
      {ticks.map((axisTicks, i) => (
        <g className="axis-ticks" key={i}>
          {axisTicks.map((d) => (
            <Tick key={d.tick + d.angle} {...d} />
          ))}
        </g>
      ))}
    </g>
  );
}
