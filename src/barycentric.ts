import { sum } from "d3-array";
import { Coord } from "./types";

type Accessor = (d: any) => number; // number[] | Record<string,unknown>

export type Barycentric = ReturnType<typeof barycentric>

export default function barycentric() {
  const { sin, cos, PI } = Math,
    rad = PI / 180;
  let normalizeData = true; // TODO make normalizeData toggleable

  // accessor functions
  let a: Accessor = (d) => d[0];
  let b: Accessor = (d) => d[1];
  let c: Accessor = (d) => d[2];

  const angles = [-90, 150, 30]; // angles for equilateral triangle
  let [vA, vB, vC] = angles.map((d): Coord => [cos(d * rad), sin(d * rad)]); // default vertices

  // Composition closure operator: https://en.wikipedia.org/wiki/Compositional_data
  // Returns a composition version of the array where the elements are normalized to sum to 1
  function normalize(_: any): [number, number, number] {
    // number[] | Record<string, unknown>
    const values: [number, number, number] = [a(_), b(_), c(_)];
    const total = sum(values);
    if (total === 0) return [0, 0, 0];
    return values.map((d) => d / total) as [number, number, number];
  }

  const barycentric = function (d: any): Coord {
    // TODO: ternary data type : number[] | Record<string, unknown> | Map | Set more?
    const [dA, dB, dC] = normalizeData ? normalize(d) : d;

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
      lambda1 = Math.abs((yByC * xxC + xCxB * yyC) / d),
      lambda2 = Math.abs((yCyA * xxC + xAxC * yyC) / d),
      lambda3 = Math.abs(1 - lambda1 - lambda2);

    return [lambda1, lambda2, lambda3];
  };

  function aAccessor(fn: Accessor): Barycentric
  function aAccessor(): Accessor 
  function aAccessor(fn?: Accessor) {
    return fn ? ((a = fn), barycentric) : a;
  };

  barycentric.a = aAccessor


  function bAccessor(fn: Accessor): Barycentric
  function bAccessor(): Accessor 
  function bAccessor(fn?: Accessor) {
    return fn ? ((b = fn), barycentric) : b;
  };

  barycentric.b = bAccessor

  function cAccessor(fn: Accessor): Barycentric
  function cAccessor(): Accessor 
  function cAccessor(fn?: Accessor) {
    return fn ? ((c = fn), barycentric) : c;
  };
  
  barycentric.c = cAccessor

  // barycentric.c = function (fn?: Accessor): CAccessor {
  //   return fn ? ((c = fn), barycentric) : c;
  // };
  // interface CAccessor {
  //   (fn: Accessor): Barycentric,
  //   (): Accessor
  // }

  
  barycentric.normalize = normalize;

  function vertices(ABC: [Coord, Coord, Coord]): typeof barycentric;  
  function vertices(): [Coord, Coord, Coord];
  function vertices(ABC?: [Coord, Coord, Coord]) {
    return ABC
      ? ((vA = ABC[0]), (vB = ABC[1]), (vC = ABC[2]), barycentric)
      : ([vA, vB, vC] as [Coord, Coord, Coord]);
  };

  barycentric.vertices = vertices

  return barycentric;
}
