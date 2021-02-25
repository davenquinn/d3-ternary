import {
  line,
  curveLinear,
  curveCardinal,
  curveBasis,
  curveCatmullRom,
  curveLinearClosed,
  curveBasisClosed,
  curveCardinalClosed,
  curveCatmullRomClosed,
  symbolCircle,
  symbolTriangle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolWye,
  symbol,
} from "d3-shape";

const filterEmpties = ({ a, b, c }) => a + b + c !== 0;

const symbolGenerator = symbol();

const symbolMap = new Map([
  ["circle", symbolCircle],
  ["triangle", symbolTriangle],
  ["cross", symbolCross],
  ["diamond", symbolDiamond],
  ["square", symbolSquare],
  ["star", symbolStar],
  ["wye", symbolWye],
]);

export function Points({ points, convert }) {
  const ternaryPoints = points.filter(filterEmpties).map((d) => {
    const position = convert(d);
    const type = symbolMap.get(d.symbol);
    const path = symbolGenerator.type(type).size(+d.size)();

    return { position, path, ...d };
  });

  return (
    <g className="points">
      {ternaryPoints.map((d, i) => (
        <path
          key={i} // always ordered so ok right
          transform={`translate(${d.position})`}
          fill={d.fill}
          title={d.title}
          opacity={d.opacity}
          stroke={d.stroke}
          d={d.path}
        />
      ))}
    </g>
  );
}

const lineGen = line().curve(curveLinear);

function seperate(lines) {
  const linesToDraw = lines.reduce(
    (acc, point) => {
      const drawLine = acc[acc.length - 1];

      if (point.enabled) {
        drawLine.push(point); // add to nested array
      } else if (drawLine.length > 0) {
        acc.push([]); // add new Line array
      }
      return acc;
    },
    [[]]
  );

  return linesToDraw;
}

const curveMap = new Map([
  ["linear", line().curve(curveLinear)],
  ["basis", line().curve(curveBasis)],
  ["cardinal", line().curve(curveCardinal)],
  ["catmullRom", line().curve(curveCatmullRom)],
]);

export function Lines({ lines, convert }) {
  const linesToDraw = seperate(lines)
    .filter((d) => d.length > 1)
    .map((linePoints) => {
      const ternaryPoints = linePoints.map(convert);

      // only use style props of first point of line!
      const {
        curve,
        opacity,
        stroke,
        strokeDasharray,
        markerStart,
        markerEnd,
        strokeWidth,
        title,
      } = linePoints[0];

      const d = curveMap.get(curve)(ternaryPoints);

      return {
        curve,
        opacity,
        stroke,
        markerStart: markerStart ? "url(#arrow)" : null,
        markerEnd: markerEnd ? "url(#arrow-reverse)" : null,
        strokeDasharray,
        strokeWidth,
        title,
        d,
        fill: "none",
      };
    });

  return (
    <g className="ternary-lines">
      {linesToDraw.map((lineProps, i) => (
        <path key={i} {...lineProps} />
      ))}
    </g>
  );
}

const curveMapClosed = new Map([
  ["linear", line().curve(curveLinearClosed)],
  ["basis", line().curve(curveBasisClosed)],
  ["cardinal", line().curve(curveCardinalClosed)],
  ["catmullRom", line().curve(curveCatmullRomClosed)],
]);

export function Areas({ areas, convert }) {
  const drawAreas = seperate(areas)
    .filter((d) => d.length > 1)
    .map((areaPoints) => {
      const ternaryPoints = areaPoints.map(convert);

      // only use style props of first point of area!
      const { curve, opacity, fill, title } = areaPoints[0];

      const d = curveMapClosed.get(curve)(ternaryPoints);

      return {
        opacity,
        title,
        d,
        fill,
      };
    });

  return (
    <g className="ternary-areas">
      {drawAreas.map((areaProps, i) => (
        <path key={i} {...areaProps} />
      ))}
    </g>
  );
}

export function Text({ text, convert }) {

  const ternaryText = text.map((d) => {
    const position = convert(d);

    const strokeWidth = d.fontSize / 6.5;

    return { position, strokeWidth, ...d };
  });

  return (
    <g className="text">
      {ternaryText.map((d, i) => (
        <text
          key={i}
          transform={`translate(${d.position})rotate(${d.rotation})`}
          fill={d.fill}
          opacity={d.opacity}
          textAnchor={d.textAnchor}
          stroke="white"
          fontSize={d.fontSize}
          paintOrder="stroke"
          strokeWidth={d.strokeWidth}
        >
          {d.text}
        </text>
      ))}
    </g>
  );
}
