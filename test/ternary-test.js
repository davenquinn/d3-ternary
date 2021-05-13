import tape from "tape";
import { ternaryPlot, barycentric } from "../dist/d3-ternary.js";

// example test: https://github.com/Fil/d3-tricontour/blob/master/test/tricontours-test.js

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
    [3.061616997868383e-14, -500],
    [433.01270189221935, 249.99999999999997],
    [-433.01270189221935, 249.99999999999997],
    [-216.50635094610965, -125],
    [0, 249.99999999999997],
    [216.5063509461097, -125],
    [0, -2.7755575615628914e-14],
  ];

  test.deepEqual(ternaryValues.map(t), testCoordinates);
  test.end();
});

tape("ternaryPlot() has the expected default domains", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.deepEqual(t.domains(), [
    [0, 1],
    [0, 1],
    [0, 1],
  ]);
  test.end();
});

tape("ternaryPlot() has the expected default radius", (test) => {
  const b = barycentric();
  const t = ternaryPlot(b);

  test.equal(t.radius(), 500);
  test.end();
});
