import { barycentric, ternaryPlot } from "./d3-ternary/index";
import { useRef } from "react";

export default function useTernaryPlot({
  radius = 500,
  labels = ['A', 'B', 'C'],
  domains = [[0,1], [0,1], [0,1]],
  tickAngles = 60,
  tickCounts = 10,
  tickSizes = 6,
  gridLineCounts = 20,
  labelAngles = [0, 60, -60],
  labelOffsets = 45,
}) {

  const { current: ternaryProjection } = useRef(
    barycentric()
      .a((d) => d.a)
      .b((d) => d.b)
      .c((d) => d.c)
  );

  // maybe in a useMemo?
  const plot = ternaryPlot(ternaryProjection)
    .domains(domains)
    .radius(radius)
    .labels(labels)
    .tickAngles(tickAngles)
    .tickCounts(tickCounts)
    .tickSizes(tickSizes)
    .gridLineCounts(gridLineCounts)
    .labelAngles(labelAngles)
    .labelOffsets(labelOffsets);

  return { ternaryProjection, plot };
}
