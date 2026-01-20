import { gameHttp } from "./gameHttp";
import { Match } from "../models/Match";
import { Board } from "../models/Board";
import { Player } from "../models/Player";
import {PlaceHouseResponse} from "@/types/ActionsResponse";

export const API_BASE = "/api";

export function createMatch(
  players: number,
  width: number,
  height: number,
  bots: boolean[]
) {
  return gameHttp<Match>(`${API_BASE}/matches`, {
    method: "POST",
    body: JSON.stringify({ players, width, height, bots }),
  });
}

export function getBoard(matchId: number) {
  return gameHttp<Board>(`${API_BASE}/board/${matchId}`);
}

export function getPlayers(matchId: number) {
  return gameHttp<Player[]>(`${API_BASE}/players/${matchId}`);
}

export function getMatch(matchId: number) {
  return gameHttp<Match>(`${API_BASE}/matches/${matchId}`);
}

export function placeStartingHouse(matchId: number, playerId: number, x: number, y: number) {
  return gameHttp<PlaceHouseResponse>(`/api/actions/${matchId}/place`, {
    method: "POST",
    body: JSON.stringify({ playerId, x, y }),
  });
}

export function startMatch(matchId: number) {
  return gameHttp<Match>(`/api/matches/${matchId}/start`, {
    method: "POST",
  });
}