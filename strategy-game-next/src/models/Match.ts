export type MatchStatus = "PENDING" | "RUNNING" | "FINISHED";

export interface Match {
  id: number;
  status: MatchStatus;
  players: number;
  width: number;
  height: number;
  currentTurn: number | null;
  winnerSeat: number | null;
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
}
