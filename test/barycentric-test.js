import tape from "tape";
import { barycentric } from "../dist/d3-ternary.js";

tape("barycentric() converts ternary data correctly", (test) => {
  const b = barycentric();

  const ternaryValues = [
    [1, 0, 0],
    [0, 0, 1],
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
  ];

  const coordinates = ternaryValues.map((v) => b(v));

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
  test.end();
});

tape("barycentric().a() sets the a accessor", (test) => {
  const b = barycentric();

  const accessor = (d) => d[3];

  b.a(accessor);

  const data = [, 0, 0, 100];

  test.deepEqual(b(data), [6.123233995736766e-17, -1]); // [0, -1]
  test.end();
});

tape(
  "barycentric().invert() correctly computes ternary values from coordinates",
  (test) => {
    const b = barycentric();

    const coordinates = [
      [6.123233995736766e-17, -1],
      [0.8660254037844387, 0.49999999999999994],
      [-0.8660254037844387, 0.49999999999999994],
      [-0.4330127018922193, -0.25],
      [0, 0.49999999999999994],
      [0.4330127018922194, -0.25],
      [0, -5.551115123125783e-17],
    ];

    const inverted = coordinates.map(b.invert).map((d) => d.map((e) => +e));

    const testTernaryValues = [
      [1, 0, 0],
      [0, 0, 1],
      [0, 1, 0],
      [0.5, 0.5, 0],
      [0, 0.5, 0.5],
      [0.5, 0, 0.5],
      [0.33333333333333337, 0.33333333333333337, 0.33333333333333326],
    ];

    test.deepEqual(inverted, testTernaryValues); // [0, -1]
    test.end();
  },
);

tape("barycentric() handles rotation correctly", (test) => {
  const b = barycentric();

  // Test default rotation (0)
  const noRotation = b([1, 0, 0]);
  test.deepEqual(noRotation, [6.123233995736766e-17, -1]);

  // Test 120 degree rotation
  b.rotation(120);
  const rotated = b([1, 0, 0]);

  test.ok(Math.abs(rotated[0]) - 0.866 < 1e-4);
  test.ok(Math.abs(rotated[1]) - 0.5 < 1e-4);

  test.end();
});

tape("barycentric() handles custom domains", (test) => {
  const b = barycentric();

  // Set custom domains
  b.domains([
    [0, 0.7],
    [0, 0.7],
    [0.3, 1],
  ]);

  // Test point conversion with scaled domains
  const point = b([50, 25, 25]);

  test.deepEqual(point, [-0.3711537444790451, -0.5714285714285715]);

  test.end();
});

tape("barycentric() normalize() handles invalid inputs", (test) => {
  const b = barycentric();

  // Should throw on NaN
  test.throws(() => b([NaN, 1, 1]));

  // Should normalize negative values
  const normalized = b([-1, 1, 1]);
  test.ok(normalized.every((n) => !Number.isNaN(n)));

  test.end();
});
