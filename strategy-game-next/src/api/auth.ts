import { http } from "./http";
import { User } from "../models/User";

export function login(username: string, password: string) {
  return http<{ token: string; user: User
  }>("/api/users/login",
      { method: "POST",
        body: JSON.stringify({ username, password }),
      });
}

export function register(username: string, password: string, description?: string) {
  return http<User>("/api/users/register",
      { method: "POST",
        body: JSON.stringify({ username, password, description }),
      });
}

export async function updateUser(id: number, data: {
  username?: string;
  description?: string;
}) {
  const res = await fetch(`/api/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer mock-token",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

