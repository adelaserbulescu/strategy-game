import * as React from "react";
import type { NextPage } from "next";
import { login } from "@/api/auth";
import { useRouter } from "next/router";

const LoginPage: NextPage = () => {
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);
    const router = useRouter();

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            setLoading(true);

            const res = await login(username.trim(), password) as LoginResponse;

            // 🔒 Defensive checks (VERY important in messy codebases)
            if (!res || !res.token || !res.user) {
                console.error("Unexpected login response:", res);
                throw new Error("Invalid login response from server.");
            }

            const { token, user } = res;

            // ✅ Save auth data
            localStorage.setItem("token", token);
            localStorage.setItem("userId", String(user.id));
            localStorage.setItem("username", user.username);
            localStorage.setItem("description", user.description ?? "");

            setSuccess("Logged in successfully.");

            router.push("/lobby");
        } catch (err: any) {
            setError(err?.message ?? "Login failed.");
        } finally {
            setLoading(false);
        }
    }


    return (
        <main style={styles.page}>
            <section style={styles.card}>
                <h1 style={styles.h1}>Login</h1>

                <form onSubmit={onSubmit} style={styles.form}>
                    <label style={styles.label}>
                        Username
                        <input
                            style={styles.input}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            disabled={loading}
                        />
                    </label>

                    <label style={styles.label}>
                        Password
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </label>

                    {error && <p style={styles.error}>{error}</p>}
                    {success && <p style={styles.success}>{success}</p>}

                    <button style={styles.button} disabled={loading} type="submit">
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p style={styles.footer}>
                    No account? <a href="/register" style={styles.link}>Register</a>
                </p>
            </section>
        </main>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#fff",
        color: "#000",
        padding: 16,
        fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif',
    },
    card: {
        width: "100%",
        maxWidth: 420,
        border: "1px solid #000",
        padding: 16,
    },
    h1: { margin: "0 0 12px 0", fontSize: 22, fontWeight: 700 },
    form: { display: "grid", gap: 12 },
    label: { display: "grid", gap: 6, fontSize: 14 },
    input: {
        border: "1px solid #000",
        padding: "8px 10px",
        fontSize: 14,
        outline: "none",
        background: "#fff",
        color: "#000",
    },
    button: {
        border: "1px solid #000",
        background: "#000",
        color: "#fff",
        padding: "10px 12px",
        fontSize: 14,
        cursor: "pointer",
    },
    error: { margin: 0, color: "#000", background: "#fff", border: "1px solid #000", padding: 8 },
    success: { margin: 0, color: "#000", background: "#fff", border: "1px solid #000", padding: 8 },
    footer: { marginTop: 12, fontSize: 14 },
    link: { color: "#000", textDecoration: "underline" },
};

export default LoginPage;
