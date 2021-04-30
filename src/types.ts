export interface Transform {
  k: number;
  x: number;
  y: number;
}

export type Domains = [[number, number], [number, number], [number, number]];

export type Coord = [number, number];

export type TextAnchor = "start" | "middle" | "end"

export interface AxisLabelProps {
  label : string | number;
  angle : number;
  position: Coord;
  fontSize: number;
  textAnchor: TextAnchor;
}

export interface TickProps {
  tick: number | string; 
  angle: number; 
  textAnchor: TextAnchor; 
  size: number; 
  position: Coord
}
