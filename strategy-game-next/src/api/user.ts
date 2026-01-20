import { http } from "./http";
import { User } from "../models/User";


/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  return http<User>("user", `/api/users/${userId}`);
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: number,
  data: Partial<Pick<User, "username" | "description">>
) {
  return http<User>("user", `/api/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Increment the number of games won
 * (called by Game Engine after match finishes)
 */
export async function incrementWins(userId: number) {
  return http<User>("user", `/api/users/${userId}/wins/increment`, {
    method: "POST",
  });
}

/**
 * Admin-only: List all users
 */
export async function listUsers() {
  return http<User[]>(`user`, `/api/users`);
}
