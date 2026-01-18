import { http } from "./http";

export type AttackResponse = {
  success: boolean;
  message: string;
  traceId?: string;
};

export function attackCell(
  matchId: number,
  playerId: number,
  x: number,
  y: number
) {
  return http<AttackResponse>(
    "game",
    `/api/actions/${matchId}/attack`,
    {
      method: "POST",
      body: JSON.stringify({ playerId, x, y }),
    }
  );
}
