export interface User {
  id: number;
  username: string;
  description?: string;
  gamesWon: number;
  role: "PLAYER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
}
