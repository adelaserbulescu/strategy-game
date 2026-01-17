import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../api/auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const auth = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    const res = await apiLogin(username, password);
    auth.login(res.token, res.user);
    router.push("/lobby");
  };

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="Username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
      <div style={{ marginTop: 20 }}>
        <button
          onClick={() => router.push("/register")}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          New here? Click to register!
        </button>
      </div>
    </div>
    
  );
}
