// src/pages/admin.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

type UserSummary = {
  id: number;
  username: string;
  role: "ADMIN" | "PLAYER";
  gamesWon?: number;
};

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "ADMIN") {
      router.push("/lobby");
      return;
    }

    loadUsers();
  }, [user]);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        headers: {
          Authorization: "Bearer mock-admin-token",
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1>Admin Panel 👑</h1>

      <button onClick={() => router.push("/lobby")}>
        Back to Lobby
      </button>

      {loading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
          }}
        >
          <thead>
            <tr>
              <th style={{ borderBottom: "1px solid #ccc" }}>ID</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Username</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Role</th>
              <th style={{ borderBottom: "1px solid #ccc" }}>Games Won</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>
                  {u.role === "ADMIN" ? "ADMIN 👑" : "PLAYER"}
                </td>
                <td>{u.gamesWon ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
