// src/pages/profile.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { updateUser } from "../api/user";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    setUsername(user.username);
    setDescription(user.description || "");
  }, [user, router]);

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await updateUser(user.id, {
        username,
        description,
      });
      alert("Profile updated");
      // Optional: refresh user in context
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h1>Profile</h1>

      <p>
        <strong>Role:</strong>{" "}
        {user.role === "ADMIN" ? "ADMIN 👑" : "PLAYER"}
      </p>

      <p>
        <strong>Games Won:</strong> {user.gamesWon}
      </p>

      <div>
        <label>Username: </label>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>

      <div>
        <label>Description: </label>
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <button onClick={handleSave} disabled={saving}>
          {saving ? "Saving... " : "Save "}
        </button>
        <ul><button onClick={() => router.push("/lobby")}>
        Back to Lobby
        </button></ul>
        <button onClick={logout}> Logout</button>
      </div>
    </div>
  );
}
