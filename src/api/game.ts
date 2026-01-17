import { http } from "./http";
import { Match } from "../models/Match";
import { Board } from "../models/Board";
import { Player } from "../models/Player";

export const API_BASE = "/api";

export function createMatch(
  players: number,
  width: number,
  height: number,
  bots: boolean[]
) {
  return http<Match>(`${API_BASE}/matches`, {
    method: "POST",
    body: JSON.stringify({ players, width, height, bots }),
  });
}

export function getBoard(matchId: number) {
  return http<Board>(`${API_BASE}/board/${matchId}`);
}

export function getPlayers(matchId: number) {
  return http<Player[]>(`${API_BASE}/players/${matchId}`);
}

export function getMatch(matchId: number) {
  return http<Match>(`${API_BASE}/matches/${matchId}`);
}

export function build(matchId: number, x: number, y: number) {
  return http<any>(`${API_BASE}/matches/${matchId}/build`, {
    method: "POST",
    body: JSON.stringify({ x, y }),
  });
}

export async function buildCell(
  matchId: number,
  x: number,
  y: number,
  seat: number
) {
  return http<any>(`${API_BASE}/matches/${matchId}/build-cell`, {
    method: "POST",
    body: JSON.stringify({ x, y, seat }),
  });
}


export function endTurn(matchId: number) {
  return http<any>(`${API_BASE}/matches/${matchId}/end-turn`, {
    method: "POST",
  });
}
