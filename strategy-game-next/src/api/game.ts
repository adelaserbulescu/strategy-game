import { http } from "./http";
import { Match } from "../models/Match";
import { Board } from "../models/Board";
import { Player } from "../models/Player";
import { API_BASES } from "./backends";

export function createMatch(
  players: number,
  width: number,
  height: number,
  bots: boolean[]
) {
  return http<Match>('game', `${API_BASES["game"]}/matches`, {
    method: "POST",
    body: JSON.stringify({ players, width, height, bots }),
  });
}

export function getBoard(matchId: number) {
  return http<Board>('game', `${API_BASES["game"]}/board/${matchId}`);
}

export function getPlayers(matchId: number) {
  return http<Player[]>(`game`, `${API_BASES["game"]}/players/${matchId}`);
}

export function getMatch(matchId: number) {
  return http<Match>(`game`, `${API_BASES["game"]}/matches/${matchId}`);
}

export function build(matchId: number, x: number, y: number) {
  return http<any>(`game`, `${API_BASES["game"]}/matches/${matchId}/build`, {
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
  return http<any>('game', `${API_BASES["game"]}/matches/${matchId}/build-cell`, {
    method: "POST",
    body: JSON.stringify({ x, y, seat }),
  });
}


export function endTurn(matchId: number) {
  return http<any>('game', `${API_BASES["game"]}/matches/${matchId}/end-turn`, {
    method: "POST",
  });
}
