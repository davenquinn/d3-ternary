import tape from "tape";
import { ternaryPlot, barycentric } from "../dist/d3-ternary.js";

// example test: https://github.com/Fil/d3-tricontour/blob/master/test/tricontours-test.js

tape("barycentric() has the expected default vertices", (test) => {
  const b = barycentric();

  test.deepEqual(b.vertices(), [
    [6.123233995736766e-17, -1], // -90° [0, 1]
    [-0.8660254037844387, 0.49999999999999994], // 150° [-sqrt(3)/2, 1/2]
    [0.8660254037844387, 0.49999999999999994], // 30° [sqrt(3)/2, 1/2]
  ]);
  test.end()
});

tape("barycentric() converts ternary data correctly", (test) => {
  const b = barycentric();

  const ternaryValues = [
    [100, 0, 0],
    [0, 0, 100],
    [0, 100, 0],
    [50, 50, 0],
    [0, 50, 50],
    [50, 0, 50],
    [33, 33, 33],
  ];

  const coordinates = ternaryValues.map(b);

  const testCoordinates = [
    [6.123233995736766e-17, -1],
    [0.8660254037844387, 0.49999999999999994],
    [-0.8660254037844387, 0.49999999999999994],
    [-0.4330127018922193, -0.25],
    [0, 0.49999999999999994],
    [0.4330127018922194, -0.25],
    [0, -5.551115123125783e-17],
  ];

  test.deepEqual(coordinates, testCoordinates);
  test.end()

});

tape("barycentric().a() sets the a accessor", (test) => {
  const b = barycentric();

  const accessor = (d) => d[3];

  b.a(accessor);

  const data = [, 0, 0, 100];

  test.deepEqual(b(data), [6.123233995736766e-17, -1]) // [0, -1]
  test.end()

});

tape("ternaryPlot() has the expected default domains", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.deepEqual(t.domains(), [
    [0, 1],
    [0, 1],
    [0, 1],
  ]);
  test.end()

});
