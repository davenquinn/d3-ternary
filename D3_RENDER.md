# D3

```javascript
const b = barycentric();
const t = ternaryPlot(b);

const axisLabelsGroup = chart
  .append("g")
  .attr("class", "axis-labels")
  .call(axisLabels, t.axisLabels());

const gridLinesPaths = t
  .gridLines()
  .map((axisGrid) => axisGrid.map(d3.line()).join(" "));

const gridGroup = chart
  .append("g")
  .attr("class", "grid")
  .call(grid, gridLinesPaths);

const axisTicksGroups = chart
  .append("g")
  .attr("class", "ternary-ticks")
  .attr("font-size", 10)
  .selectAll("g")
  .data(t.ticks())
  .join("g")
  .attr("class", "axis-ticks");

axisTicksGroups.call(ticks);
```

## Ticks

```javascript
const ticks = (g, ticks) =>
  g
    .selectAll("g")
    .data(
      (d) => d,
      (d) => d.tick,
    )
    .join(
      (enter) => {
        const tickGroups = enter
          .append("g")
          .attr("class", "tick")
          .attr(
            "transform",
            (d) => `translate(${d.position})rotate(${d.angle})`,
          );

        tickGroups
          .append("text")
          .attr("text-anchor", (d) => d.textAnchor)
          .attr(
            "dx",
            (d) => (-d.size - 5) * (d.textAnchor === "start" ? -1 : 1),
          )
          .attr("dy", ".5em")
          .text((d) => d.tick);

        tickGroups
          .append("line")
          .attr("transform", "rotate(90)")
          .attr("y2", (d) => d.size * (d.textAnchor === "start" ? -1 : 1))
          .attr("stroke", "grey");

        return tickGroups;
      },
      (update) => update.attr("transform", (d) => `translate(${d.position})`),
      (exit) => exit.remove(),
    );
```

## Grid Lines

```javascript
const grid = (g, gridLines) =>
  g
    .selectAll("g.grid-axis")
    .data(gridLines)
    .join(
      (enter) => {
        const gridAxis = enter.append("g").attr("class", "grid-axis");

        gridAxis
          .selectAll("line")
          .data((d) => d)
          .join("line")
          .attr("x1", (d) => d[0][0])
          .attr("y1", (d) => d[0][1])
          .attr("x2", (d) => d[1][0])
          .attr("y2", (d) => d[1][1])
          .attr("stroke", "#e3e3e3")
          .attr("stroke-width", 1);

        return gridAxis;
      },
      (update) => {
        update
          .selectAll("line")
          .data((d) => d)
          .join("line")
          .attr("x1", (d) => d[0][0])
          .attr("y1", (d) => d[0][1])
          .attr("x2", (d) => d[1][0])
          .attr("y2", (d) => d[1][1]);
      },
    );
```

Using a single path command per axis gridlines:

```javascript
const t = ternaryPlot(b);

const gridLinesPaths = t
  .gridLines()
  .map((axisGrid) => axisGrid.map(d3.line()).join(" "));

const grid = (g, gridLines) =>
  g
    .selectAll("path")
    .data(gridLinesPaths)
    .join(
      (enter) =>
        enter
          .append("path")
          .attr("d", (d) => d)
          .attr("stroke", "#e3e3e3")
          .attr("stroke-width", 1),
      (update) => update.attr("d", (d) => d), // update path command
      // theres no exit, lines are only drawn upto 'initial' triangle bounds
    );
```

## Axis Labels

```javascript
const axisLabels = (g, labels) =>
  g
    .selectAll("text")
    .data(labels, (d) => d.label)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("dominant-baseline", "middle")
          .attr(
            "transform",
            (d, i) => `translate(${d.position})rotate(${d.angle})`,
          )
          .attr("text-anchor", "middle")
          .text((d) => d.label),
      (update) =>
        update.attr(
          "transform",
          (d, i) => `translate(${d.position})rotate(${d.angle})`,
        ),
    );
```

### Single Line for each Gridline

```javascript
const grid = (g, gridLines) =>
  g
    .selectAll("g.grid-axis")
    .data(gridLines)
    .join(
      (enter) => {
        const gridAxis = enter.append("g").attr("class", "grid-axis");

        gridAxis
          .selectAll("line")
          .data((d) => d)
          .join("line")
          .attr("x1", (d) => d[0][0])
          .attr("y1", (d) => d[0][1])
          .attr("x2", (d) => d[1][0])
          .attr("y2", (d) => d[1][1])
          .attr("stroke", "#e3e3e3")
          .attr("stroke-width", 1);

        return gridAxis;
      },
      (update) => {
        update
          .selectAll("line")
          .data((d) => d)
          .join("line")
          .attr("x1", (d) => d[0][0])
          .attr("y1", (d) => d[0][1])
          .attr("x2", (d) => d[1][0])
          .attr("y2", (d) => d[1][1]);
      },
    );
```
