// import { sum } from "d3-array";

export default function () {
  const { sin, cos, PI } = Math,
    rad = PI / 180;

  // accessors
  let a = (d) => d[0];
  let b = (d) => d[1];
  let c = (d) => d[2];

  const angles = [-90, 150, 30]; // angles for equilateral triangle
  let [vA, vB, vC] = angles.map((d) => [cos(d * rad), sin(d * rad)]); // default vertices

  function normalize(_) {
    const values = [a(_), b(_), c(_)];
    const total = d3.sum(values);
    if (total === 0) return [0, 0, 0];
    return values.map((d) => d / total);
  }

  function ternary(d) {
    const [normA, normB, normC] = normalize(d);

    return [
      vA[0] * normA + vB[0] * normB + vC[0] * normC,
      vA[1] * normA + vB[1] * normB + vC[1] * normC,
    ];
  }

  // en.wikipedia.org/wiki/Barycentric_coordinate_system#Conversion_between_barycentric_and_Cartesian_coordinates
  ternary.invert = function ([x, y]) {
    const [xA, yA] = vA,
      [xB, yB] = vB,
      [xC, yC] = vC;

    const yByC = yB - yC,
      xCxB = xC - xB,
      xAxC = xA - xC,
      yAyC = yA - yC,
      yCyA = yC - yA,
      xxC = x - xC,
      yyC = y - yC;

    const d = yByC * xAxC + xCxB * yAyC,
      lambda1 = (yByC * xxC + xCxB * yyC) / d,
      lambda2 = (yCyA * xxC + xAxC * yyC) / d,
      lambda3 = 1 - lambda1 - lambda2;

    return [lambda1, lambda2, lambda3];
  };

  ternary.a = function (fn) {
    return arguments.length ? ((a = fn), ternary) : a;
  };

  ternary.b = function (fn) {
    return arguments.length ? ((b = fn), ternary) : b;
  };

  ternary.c = function (fn) {
    return arguments.length ? ((c = fn), ternary) : c;
  };

  ternary.normalize = normalize;

  ternary.vertices = function (ABC) {
    return arguments.length
      ? ((vA = ABC[0]), (vB = ABC[1]), (vC = ABC[2]), ternary)
      : [vA, vB, vC];
  };

  return ternary;
}
