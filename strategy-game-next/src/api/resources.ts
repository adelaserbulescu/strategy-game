import { http } from "./http";

export function resourceGain(matchId: number) {
  return http<{ success: boolean; message: string; traceId: string }>(
    "game",
    `/api/resources/${matchId}/resource-gain`,
    { method: "POST" }
  );
}

export function lightningRecharge(matchId: number) {
  return http<{ success: boolean; message: string; traceId: string }>(
    "game",
    `/api/resources/${matchId}/lightning-recharge`,
    { method: "POST" }
  );
}
