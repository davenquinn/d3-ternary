export interface Transform {
  k: number;
  x: number;
  y: number;
}
export type Domains = [[number, number], [number, number], [number, number]];
export type Coord = [number, number];
export interface Barycentric {
  (d: object | any[]): Coord;
  invert([x, y]: Coord): [number, number, number];
  a(fn?: () => number): (d: number[] | object) => any;
  b(fn?: () => number): (d: number[] | object) => any;
  c(fn?: () => number): (d: number[] | object) => any;
  normalize: (_: object | any[]) => number[];
  vertices(ABC?: [Coord, Coord, Coord]): () => any;
}
export interface TernaryPlot {
    (): void;
    vertices: (newScaledVertices?: [Coord, Coord, Coord]) => any;
    axisLabels({ center }?: {
        center?: boolean;
    }): {
        position: number[];
        label: string;
        angle: number;
    }[];
    setDomains(domains: Domains)
}