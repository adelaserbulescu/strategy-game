import { http } from "./http";
import { Match } from "../models/Match";
import { Board } from "../models/Board";
import { Player } from "../models/Player";

export function createMatch(
  players: number,
  width: number,
  height: number,
  bots: boolean[]
) {
  return http<Match>('game', '/api/matches', {
    method: "POST",
    body: JSON.stringify({ players, width, height, bots }),
  });
}

export function startMatch(matchId: number) {
  return http<Match>('game', `/api/matches/${matchId}/start`, {
    method: "POST",
  });
}

export function getBoard(matchId: number) {
  console.log("Getting board for matchId:", matchId);
  if(!matchId) throw new Error("Invalid matchId");
  return http<Board>('game', `/api/board/${matchId}`);
}

export function getPlayers(matchId: number) {
  return http<Player[]>(`game`, `/api/players/${matchId}`);
}

export function getMatch(matchId: number) {
  return http<Match>(`game`, `/api/matches/${matchId}`);
}

export function build(matchId: number, x: number, y: number) {
  return http<any>(`game`, `/api/matches/${matchId}/build`, {
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
  return http<any>('game', `/api/matches/${matchId}/build-cell`, {
    method: "POST",
    body: JSON.stringify({ x, y, seat }),
  });
}


export function endTurn(matchId: number) {
  return http<any>('game', `/api/matches/${matchId}/end-turn`, {
    method: "POST",
  });
}
