export const grid = (g, gridLines) =>
  g
    .selectAll("path")
    .data(gridLines)
    .join(
      (enter) =>
        enter
          .append("path")
          .attr("d", (d) => d)
          .attr("stroke", "#e3e3e3")
          .attr("stroke-width", (d, i) => (i & 1 ? 1 : 2)),
      (update) => update.attr("d", (d) => d)
      // theres no exit, lines are only drawn upto 'initial' triangle bounds
    );
