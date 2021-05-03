export const axisLabels = (g, labels) =>
  g
    .selectAll("text")
    .data(labels, (d) => d.label)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("dy", (d, i) => (i === 2 ? "-0.5em" : ".5em"))
          .attr(
            "transform",
            (d, i) => `translate(${d.position})rotate(${d.angle})`
          )
          .attr("text-anchor", "middle")
          .text((d) => d.label),
      (update) =>
        update.attr(
          "transform",
          (d, i) => `translate(${d.position})rotate(${d.angle})`
        )
    );

