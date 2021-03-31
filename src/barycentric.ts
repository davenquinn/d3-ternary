import { sum } from "d3-array";
import { Coord, Barycentric } from "./types";
const { sin, cos, PI } = Math;

export default function barycentricInit() {
  const rad = PI / 180;
  // let normalizeData = true;

  // accessor functions
  let a = (d: number[] | object) => d[0];
  let b = (d: number[] | object) => d[1];
  let c = (d: number[] | object) => d[2];

  const angles = [-90, 150, 30]; // angles for equilateral triangle
  let [vA, vB, vC] = angles.map((d) => [cos(d * rad), sin(d * rad)]); // default vertices

  // Composition closure operator: https://en.wikipedia.org/wiki/Compositional_data
  // Returns a composition version of the array where the elements are normalized to sum to 1
  function normalize(_: object | any[]) {
    const values = [a(_), b(_), c(_)];
    const total = sum(values);
    if (total === 0) return [0, 0, 0];
    return values.map((d) => d / total);
  }

  const barycentric = function (d: object | any[]): Coord {
    const [dA, dB, dC] = normalize(d); // normalizeData ? normalize(d) : d;

    return [
      vA[0] * dA + vB[0] * dB + vC[0] * dC,
      vA[1] * dA + vB[1] * dB + vC[1] * dC,
    ];
  };

  // en.wikipedia.org/wiki/Barycentric_coordinate_system#Conversion_between_barycentric_and_Cartesian_coordinates
  barycentric.invert = function ([x, y]: Coord): [number, number, number] {
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


  barycentric.a = function (fn?: () => number | Barycentric) {
    return arguments.length ? ((a = fn), barycentric) : a;
  };

  barycentric.b = function (fn?: () => number | Barycentric) {
    return arguments.length ? ((b = fn), barycentric) : b;
  };

  barycentric.c = function (fn?: () => number | Barycentric) {
    return arguments.length ? ((c = fn), barycentric) : c;
  };

  barycentric.normalize = normalize;

  // todo type: IF IT HAS PARAM ABC RETURN TYPE THREE COORDS 
  barycentric.vertices = function (ABC?: [Coord, Coord, Coord] | Barycentric) {
    //: [number, number, number] | (() => void)
    return arguments.length
      ? ((vA = ABC[0]), (vB = ABC[1]), (vC = ABC[2]), barycentric)
      : [vA, vB, vC];
  };

  return barycentric;
}
