import { http } from "./http";
import { TradeOffer } from "../models/Trade";

export function createTrade(matchId: number, body: {
  from: number;
  to: number;
  give: string;
  get: string;
  ttlMs: number;
}) {
  return http<TradeOffer>(
    "game",
    `/api/trades/${matchId}`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function listTrades(matchId: number, status?: string) {
  const q = status ? `?status=${status}` : "";
  return http<TradeOffer[]>(
    "game",
    `/api/trades/${matchId}/trades${q}`);
}

export function acceptTrade(
  matchId: number,
  tradeId: number,
  toSeat: number
) {
  return http<{ accepted: boolean }>(
    "game",
    `/api/trades/${matchId}/${tradeId}/accept`,
    {
      method: "POST",
      body: JSON.stringify({ toSeat }),
    }
  );
}
