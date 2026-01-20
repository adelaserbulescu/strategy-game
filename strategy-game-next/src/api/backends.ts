// src/api/backends.ts
export const API_BASES = {
  user: process.env.NEXT_PUBLIC_USER_API!,
  game: process.env.NEXT_PUBLIC_GAME_API!,
  chat: process.env.NEXT_PUBLIC_CHAT_API!,
} as const;

if (typeof window !== "undefined") {
  console.log("User API Base:", API_BASES.user);
  console.log("Game API Base:", API_BASES.game);
  console.log("Chat API Base:", API_BASES.chat);
}

export type Backend = keyof typeof API_BASES;
