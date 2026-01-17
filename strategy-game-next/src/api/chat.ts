import { http } from "./http";
import {
  ChatHistory,
  AIRecommendation,
  ChatMessage,
} from "../models/Chat";

export const CHAT_API = "/api/chat";

/* -----------------------------
   Chat history
-------------------------------- */

export function getChatHistory(matchId: number) {
  return http<ChatHistory>(`${CHAT_API}/matches/${matchId}/messages`);
}

export async function getMessages(matchId: number): Promise<ChatMessage[]> {
  const res = await fetch(`${CHAT_API}/matches/${matchId}/messages`);
  if (!res.ok) throw new Error(await res.text());

  const data = await res.json();
  return data.messages;
}

/* -----------------------------
   Send player message
-------------------------------- */

export async function sendMessage(
  matchId: number,
  message: ChatMessage
): Promise<void> {
  const res = await fetch(`${CHAT_API}/matches/${matchId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}

/* -----------------------------
   Ask AI (MAIN FEATURE)
-------------------------------- */

export function askAI(
  matchId: string,
  question: string,
  gameState: any
) {
  return http<AIRecommendation>(`${CHAT_API}/ai/recommendation`, {
    method: "POST",
    body: JSON.stringify({
      matchId,
      question,
      gameState,
    }),
  });
}


export async function getAIRecommendations(
  matchId: number
): Promise<AIRecommendation[]> {
  const res = await fetch(`${CHAT_API}/matches/${matchId}/ai/recommendations`);
  if (!res.ok) throw new Error(await res.text());

  return res.json();
}

/* -----------------------------
   Health check
-------------------------------- */

export function healthCheck() {
  return http<{ status: string }>(`${CHAT_API}/health`);
}
