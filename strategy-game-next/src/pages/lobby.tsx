import * as React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { createMatch } from "../api/game";

const PLAYER_OPTIONS = [2, 4, 6, 8] as const;

function boardForPlayers(players: number) {
    if (players <= 4) return { width: 5, height: 3 };
    return { width: 5, height: 5 };
}

const LobbyPage: NextPage = () => {
    const router = useRouter();

    const [players, setPlayers] = React.useState<number>(4);
    const { width, height } = boardForPlayers(players);

    const [bots, setBots] = React.useState<boolean[]>(Array(players).fill(false));

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Keep bots array length in sync with players
    React.useEffect(() => {
        setBots((prev) => {
            const next = Array(players).fill(false);
            for (let i = 0; i < Math.min(prev.length, next.length); i++) {
                next[i] = prev[i];
            }
            return next;
        });
    }, [players]);

    async function onStartGame() {
        setError(null);

        try {
            setLoading(true);

            const match = await createMatch(players, width, height, bots);

            router.push(`/game?matchId=${(match as any).id}&players=${players}`)
        } catch (err: any) {
            setError(err?.message ?? "Failed to create match.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main style={styles.page}>
            <section style={styles.card}>
                <h1 style={styles.h1}>Lobby</h1>

                <div style={styles.row}>
                    <label style={styles.label}>
                        Players
                        <select
                            style={styles.input}
                            value={players}
                            onChange={(e) => setPlayers(Number(e.target.value))}
                            disabled={loading}
                        >
                            {PLAYER_OPTIONS.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                    </label>

                    <div style={styles.box}>
                        <div style={styles.smallTitle}>Board</div>
                        <div style={styles.bigValue}>
                            {width} x {height}
                        </div>
                    </div>
                </div>

                {error && <p style={styles.error}>{error}</p>}

                <button style={styles.button} disabled={loading} onClick={onStartGame}>
                    {loading ? "Starting..." : "Start game"}
                </button>
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
            'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    card: {
        width: "100%",
        maxWidth: 520,
        border: "1px solid #000",
        padding: 16,
    },
    h1: { margin: "0 0 12px 0", fontSize: 22, fontWeight: 700 },
    row: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 12,
        alignItems: "end",
    },
    label: { display: "grid", gap: 6, fontSize: 14 },
    input: {
        border: "1px solid #000",
        padding: "8px 10px",
        fontSize: 14,
        background: "#fff",
        color: "#000",
    },
    box: {
        border: "1px solid #000",
        padding: 10,
    },
    smallTitle: { fontSize: 12, opacity: 0.8 },
    bigValue: { fontSize: 18, fontWeight: 700, marginTop: 4 },
    botGrid: { display: "grid", gap: 8, marginTop: 8 },
    botItem: {
        border: "1px solid #000",
        padding: 8,
        display: "flex",
        alignItems: "center",
        fontSize: 14,
    },
    error: {
        marginTop: 12,
        border: "1px solid #000",
        padding: 8,
    },
    button: {
        marginTop: 12,
        border: "1px solid #000",
        background: "#000",
        color: "#fff",
        padding: "10px 12px",
        fontSize: 14,
        cursor: "pointer",
        width: "100%",
    },
};

export default LobbyPage;
