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

  test.equal(t.radius(), 300);
  test.end();
});
