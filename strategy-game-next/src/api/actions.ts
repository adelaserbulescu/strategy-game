import {gameHttp} from "@/api/gameHttp";

export type ActionResponse = {
  success: boolean;
  message: string;
  traceId?: string;
};

export function buildHouse(
    matchId: number,
    playerId: number,
    x: number,
    y: number
) {
    return gameHttp<ActionResponse>(`/api/actions/${matchId}/build`, {
        method: "POST",
        body: JSON.stringify({ playerId, x, y }),
    });
}

export function endTurn(matchId: number, playerId: number) {
    return gameHttp<ActionResponse>(`/api/actions/${matchId}/end-turn`, {
        method: "POST",
        body: JSON.stringify({ playerId }),
    });
}

export function attackCell(
  matchId: number,
  playerId: number,
  x: number,
  y: number
) {
  return gameHttp<ActionResponse>(
    `/api/actions/${matchId}/attack`,
    {
      method: "POST",
      body: JSON.stringify({ playerId, x, y }),
    }
  );
}
