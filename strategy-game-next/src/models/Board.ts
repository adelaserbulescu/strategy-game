export type RegionType = "SKY" | "FOREST" | "WATERS" | "VILLAGES" | "MOUNTAINS";

export interface Cell {
  x: number;
  y: number;
  region: RegionType;
  ownerSeat: number;
  hits: number;
}

export interface Board {
  width: number;
  height: number;
  cells: Cell[];
}
