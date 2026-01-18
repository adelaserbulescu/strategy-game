import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const auth = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    try {
      // Call AuthContext.register directly
      // Only pass description if not empty
      if (description.trim()) {
        await auth.register(username, password, description.trim());
      } else {
        await auth.register(username, password);
      }
      router.push("/lobby");
    } catch (err: any) {
      console.error("Registration failed:", err.message || err);
      alert("Registration failed: " + (err.message || "Unknown error"));
    }
  };

  return (
    <div>
      <h1>Register</h1>
      <input
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <input
        placeholder="Description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>
    </div>
  );
}
