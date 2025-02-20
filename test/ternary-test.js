import tape from "tape";
import { ternaryPlot, barycentric } from "../dist/d3-ternary.js";

tape("ternaryPlot() convert ternary data correctly", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  const ternaryValues = [
    [100, 0, 0],
    [0, 0, 100],
    [0, 100, 0],
    [50, 50, 0],
    [0, 50, 50],
    [50, 0, 50],
    [33, 33, 33],
  ];

  const testCoordinates = [
    [1.8369701987210297e-14, -300],
    [259.8076211353316, 149.99999999999997],
    [-259.8076211353316, 149.99999999999997],
    [-129.9038105676658, -75],
    [0, 149.99999999999997],
    [129.90381056766583, -75],
    [0, -1.6653345369377348e-14],
  ];

  test.deepEqual(ternaryValues.map(t), testCoordinates);
  test.end();
});

tape("ternaryPlot() has the expected default radius", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.equal(t.radius(), 300);
  test.end();
});

tape("ternaryPlot() has expected default axis labels", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.deepEqual(t.labels(), ["A", "B", "C"]);
  test.end();
});

tape("ternaryPlot() can set and get axis labels", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  t.labels(["X", "Y", "Z"]);
  test.deepEqual(t.labels(), ["X", "Y", "Z"]);
  test.end();
});

tape("ternaryPlot() has expected default tick angles", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.deepEqual(t.tickAngles(), [0, 60, -60]);
  test.end();
});

tape("ternaryPlot() can set and get tick angles", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  t.tickAngles([30, 90, -30]);
  test.deepEqual(t.tickAngles(), [30, 90, -30]);
  test.end();
});

tape("ternaryPlot() has expected default label angles", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.deepEqual(t.labelAngles(), [0, 60, -60]);
  test.end();
});

tape("ternaryPlot() has expected default tick text anchors", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.deepEqual(t.tickTextAnchors(), ["start", "end", "end"]);
  test.end();
});

tape("ternaryPlot() has expected default tick sizes", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.deepEqual(t.tickSizes(), [6, 6, 6]);
  test.end();
});

tape("ternaryPlot() can set all tick sizes with a single number", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  t.tickSizes(10);
  test.deepEqual(t.tickSizes(), [10, 10, 10]);
  test.end();
});

tape("ternaryPlot() has expected default label offsets", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.deepEqual(t.labelOffsets(), [45, 45, 45]);
  test.end();
});

tape(
  "ternaryPlot().invert() correctly converts coordinates back to ternary values",
  (test) => {
    const b = barycentric();
    const t = ternaryPlot(b);

    const coordinates = [0, 0]; // Center point should be [33.33, 33.33, 33.33]
    const ternaryValues = t.invert(coordinates);

    test.ok(Math.abs(ternaryValues[0] - 1 / 3) < 1e-10);
    test.ok(Math.abs(ternaryValues[1] - 1 / 3) < 1e-10);
    test.ok(Math.abs(ternaryValues[2] - 1 / 3) < 1e-10);
    test.end();
  },
);

tape(
  "ternaryPlot().triangle() returns correct SVG path for default radius",
  (test) => {
    const b = barycentric();
    const t = ternaryPlot(b);

    const path = t.triangle();
    test.equal(path, "M1.8369701987210297e-14,-300L-259.8076211353316,149.99999999999997L259.8076211353316,149.99999999999997Z");
    test.end();
  },
);

tape("ternaryPlot() generates correct grid lines", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);
  
  const gridLines = t.gridLines(2);
  
  // Should return array of 3 arrays (one per axis)
  test.equal(gridLines.length, 3);
  
  // Each line should have start and end coordinates
  gridLines.forEach(axisLines => {
    axisLines.forEach(line => {
      test.equal(line.length, 2);
      test.equal(line[0].length, 2);
      test.equal(line[1].length, 2);
    });
  });
  
  test.end();
});

tape("ternaryPlot() generates correct axis labels", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);
  
  // Test default vertex positioning
  const labels = t.axisLabels();
  test.equal(labels.length, 3);
  test.deepEqual(labels.map(l => l.label), ["A", "B", "C"]);
  
  // Test centered labels
  const centeredLabels = t.axisLabels({ center: true });
  test.equal(centeredLabels.length, 3);
  
  // Centered labels should be at different positions than vertex labels
  test.notDeepEqual(
    labels.map(l => l.position),
    centeredLabels.map(l => l.position)
  );
  
  test.end();
});
