// src/components/layout/Header.tsx
import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/router";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 20px",
        backgroundColor: "#222",
        color: "white",
      }}
    >
      <h1 style={{ margin: 0 }}>Strategy Game</h1>
      {user && (
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span>{user.username}</span>
          <button
            onClick={handleLogout}
            style={{
              padding: "5px 10px",
              backgroundColor: "#ff4d4f",
              border: "none",
              borderRadius: "4px",
              color: "white",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
