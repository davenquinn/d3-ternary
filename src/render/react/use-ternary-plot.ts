import { useLayoutEffect, useRef } from "react";
import { barycentric, ternaryPlot } from "../../index";
import type {
  Domains,
  TextAnchor,
  Barycentric,
  TernaryPlot,
} from "../../types";

interface TernaryDataPoint {
  a: number;
  b: number;
  c: number;
}

interface UseTernaryPlotProps {
  radius: number;
  labels: [string, string, string];
  domains: Domains;
  tickTextAnchors: [TextAnchor, TextAnchor, TextAnchor];
  tickAngles: [number, number, number];
  tickSizes: [number, number, number] | number;
  tickCounts: [number, number, number] | number;
  gridLineCounts: [number, number, number] | number;
  labelAngles: [number, number, number];
  labelOffsets: [number, number, number] | number;
}

// TODO this is a janky solution
export function useTernaryPlot({
  radius = 300,
  labels,
  domains,
  tickTextAnchors,
  tickAngles,
  tickCounts,
  tickSizes, // = 6
  gridLineCounts, //= 20
  labelAngles, // = [0, 60, -60]
  labelOffsets, // = 45
}: UseTernaryPlotProps) {
  const nonZeroRadius = radius === 0 ? 200 : radius;

  const barycentricRef = useRef<Barycentric>(null!);
  const ternaryPlotRef = useRef<TernaryPlot>(null!);

  // created lazily once https://reactjs.org/docs/hooks-faq.html#how-to-create-expensive-objects-lazily
  function getBarycentric() {
    if (barycentricRef.current === null) {
      barycentricRef.current = barycentric()
        .a((d: TernaryDataPoint) => d.a)
        .b((d: TernaryDataPoint) => d.b)
        .c((d: TernaryDataPoint) => d.c);
    }
    return barycentricRef.current;
  }

  const ternaryProjection = getBarycentric();

  function getTernaryPlot() {
    if (ternaryPlotRef.current === null) {
      ternaryPlotRef.current =
        ternaryPlot(ternaryProjection).radius(nonZeroRadius);
    }
    return ternaryPlotRef.current;
  }

  const plot = getTernaryPlot();

  plot
    .radius(nonZeroRadius)
    .domains(domains)
    .labels(labels)
    .tickAngles(tickAngles)
    .tickTextAnchors(tickTextAnchors)
    .labelOffsets(tickCounts)
    .tickSizes(tickSizes)
    .labelAngles(labelAngles)
    .labelOffsets(labelOffsets)
    .labelOffsets(gridLineCounts);

  return plot;
}
