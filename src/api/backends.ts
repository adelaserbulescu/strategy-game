// src/api/backends.ts
export const API_BASES = {
  user: process.env.NEXT_PUBLIC_USER_API!,
  game: process.env.NEXT_PUBLIC_GAME_API!,
  chat: process.env.NEXT_PUBLIC_CHAT_API!,
} as const;

export type Backend = keyof typeof API_BASES;
