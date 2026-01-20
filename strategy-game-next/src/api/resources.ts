import { http } from "./http";
import {gameHttp} from "@/api/gameHttp";

export function resourceGain(matchId: number) {
  return gameHttp<{ success: boolean; message: string; traceId: string }>(
    `/api/resources/${matchId}/resource-gain`,
    { method: "POST" }
  );
}

export function lightningRecharge(matchId: number) {
  return gameHttp<{ success: boolean; message: string; traceId: string }>(
    `/api/resources/${matchId}/lightning-recharge`,
    { method: "POST" }
  );
}
