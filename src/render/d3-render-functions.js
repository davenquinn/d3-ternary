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

/*  

Example usage: ticks data has to be joined for each axis as follows

const axisTicksGroups = chart
  .append("g")
  .attr("class", "ticks")
  .selectAll("g")
  .data(someTernaryPlot.ticks())
  .join("g")
    .attr("class", "axis-ticks")
    .call(ticks); 
*/

export const ticks = (g) =>
  g
    .selectAll("g")
    .data(
      (d) => d,
      (d) => d.tick
    )
    .join(
      (enter) => {
        const tickGroups = enter
          .append("g")
          .attr("class", "tick")
          .attr("transform", (d) => `translate(${d.position})`);

        tickGroups
          .append("text")
          .attr("text-anchor", (d) => d.textAnchor)
          .attr("transform", (d) => `rotate(${d.angle})`)
          .attr(
            "dx",
            (d) => (-d.size - 5) * (d.textAnchor === "start" ? -1 : 1)
          )
          .attr("dy", ".5em")
          .text((d) => d.tick);

        tickGroups
          .append("line")
          .attr("transform", (d) => `rotate(${d.angle + 90})`)
          .attr("y2", (d) => d.size * (d.textAnchor === "start" ? -1 : 1))
          .attr("stroke", "grey");

        return tickGroups;
      },
      (update) => update.attr("transform", (d) => `translate(${d.position})`),
      (exit) => exit.attr("opacity", epsilon).remove()
    );

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
