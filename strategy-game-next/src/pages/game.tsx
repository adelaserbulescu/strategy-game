import * as React from "react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { getBoard, placeStartingHouse, startMatch, getMatch, getPlayers } from "../api/game";
import { buildHouse, endTurn, attackCell } from "../api/actions";
import { resourceGain, lightningRecharge } from "../api/resources";
import { Player } from "../models/Player";
import { getAiRecommendation } from "../api/chat";

import type { Board, RegionType, Cell } from "../models/Board";
import {AiRecommendationResponse} from "@/models/Chat";

const regionColor: Record<RegionType, string> = {
    SKY: "#cfe8ff",
    FOREST: "#cfeccf",
    WATERS: "#b7dbff",
    VILLAGES: "#f3dfb8",
    MOUNTAINS: "#e1e1e1",
};

const GamePage: NextPage = () => {
    const router = useRouter();
    const matchIdParam = router.query.matchId;

    const [currentTurn, setCurrentTurn] = React.useState<number>(1);

    const [selected, setSelected] = React.useState<{ x: number; y: number } | null>(null);

    const [placing, setPlacing] = React.useState(false);
    const [placeMsg, setPlaceMsg] = React.useState<string | null>(null);

    const [board, setBoard] = React.useState<Board | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const [matchStatus, setMatchStatus] = React.useState<"PENDING" | "RUNNING">("PENDING");

    const [players, setPlayers] = React.useState<Player[]>([]);

    const matchId = React.useMemo(() => {
        if (typeof matchIdParam !== "string") return null;
        const n = Number(matchIdParam);
        return Number.isFinite(n) ? n : null;
    }, [matchIdParam]);

    const playersParam = router.query.players;

    const maxPlayers = React.useMemo(() => {
        if (typeof playersParam !== "string") return 4;
        const n = Number(playersParam);
        return Number.isFinite(n) && n >= 2 ? n : 4;
    }, [playersParam]);

    const [aiOpen, setAiOpen] = React.useState(false);
    const [aiLoading, setAiLoading] = React.useState(false);
    const [aiError, setAiError] = React.useState<string | null>(null);
    const [aiRec, setAiRec] = React.useState<AiRecommendationResponse | null>(null);

    React.useEffect(() => {
        if (!matchId) return;

        let cancelled = false;

        async function load() {
            setError(null);
            setLoading(true);
            try {
                const refreshed = await refreshAll(matchId!);
                if (cancelled) return;

                // If match is pending, ensure local placement turn starts at 1
                if (refreshed.match.status === "PENDING") {
                    setCurrentTurn(1);
                }
            } catch (err: any) {
                if (!cancelled) setError(err?.message ?? "Failed to load game.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId]);


    const cellMap = React.useMemo(() => {
        if (!board) return new Map<string, Cell>();
        const m = new Map<string, Cell>();
        for (const c of board.cells) {
            m.set(`${c.x},${c.y}`, c);
        }
        return m;
    }, [board]);

    function nextTurn(turn: number, maxPlayers: number) {
        return turn >= maxPlayers ? 1 : turn + 1;
    }

    async function onPlaceHouse() {
        if (!matchId) return;

        if (!selected) {
            setPlaceMsg("Select a cell first.");
            return;
        }

        setPlaceMsg(null);

        try {
            setPlacing(true);

            const res = await placeStartingHouse(matchId, currentTurn, selected.x, selected.y);
            setPlaceMsg(res.message);

            if (!res.success) {
                // e.g. CELL_OCCUPIED - stay on same turn, keep PENDING
                return;
            }

            const updatedBoard = await reloadBoard(matchId);

            // If everyone has placed at least one house -> start match
            if (allSeatsHaveHouse(updatedBoard, maxPlayers)) {
                try {
                    const match = await startMatch(matchId);

                    setMatchStatus("RUNNING");
                    setCurrentTurn(match.currentTurn ?? 1); // should be 1
                    setSelected(null);
                    setPlaceMsg("Match started. Seat 1 can act.");
                } catch (err: any) {
                    // Still pending if start failed
                    setPlaceMsg(err?.message ?? "Everyone placed a house, but match start failed.");
                }

                return; // stop here
            }

            // Otherwise continue placement phase: go to next seat
            setCurrentTurn((t) => nextTurn(t, maxPlayers));
            setSelected(null);
        } catch (err: any) {
            setPlaceMsg(err?.message ?? "Failed to place house.");
        } finally {
            setPlacing(false);
        }
    }

    function allSeatsHaveHouse(board: Board, maxPlayers: number) {
        const seatsWithHouse = new Set<number>();
        for (const c of board.cells) {
            if (c.ownerSeat && c.ownerSeat > 0) seatsWithHouse.add(c.ownerSeat);
        }
        for (let seat = 1; seat <= maxPlayers; seat++) {
            if (!seatsWithHouse.has(seat)) return false;
        }
        return true;
    }

    async function reloadBoard(id: number) {
        const refreshed = await refreshAll(id);
        return refreshed.board;
    }

    async function onBuild() {
        if (!selected) return setPlaceMsg("Select a cell first.");
        await runActionAndAdvance(() => buildHouse(matchId!, currentTurn, selected.x, selected.y));
    }

    async function onAttack() {
        if (!selected) return setPlaceMsg("Select a cell first.");
        await runActionAndAdvance(() => attackCell(matchId!, currentTurn, selected.x, selected.y));
    }

    async function onEndTurn() {
        await runActionAndAdvance(() => endTurn(matchId!, currentTurn));
    }


    async function applyTurnStartEffects(matchId: number, prevTurn: number, nextTurn: number) {
        // If turn didn't change, do nothing
        if (prevTurn === nextTurn) return;

        // If we wrapped back to seat 1, do lightning recharge tick first
        if (nextTurn === 1 && prevTurn !== 1) {
            await lightningRecharge(matchId);
        }

        // Always apply resource gain at the start of the new player's turn
        await resourceGain(matchId);

        // Reload players so the UI updates
        const p = await getPlayers(matchId);
        setPlayers(p);
    }

    async function runActionAndAdvance(action: () => Promise<{ success: boolean; message: string }>) {
        if (!matchId) return;

        const prevTurn = currentTurn;
        setPlaceMsg(null);

        try {
            setPlacing(true);

            const res = await action();
            setPlaceMsg(res.message);

            if (!res.success) return;

            const refreshed = await refreshAll(matchId);

            // Only apply these when match is RUNNING
            if (refreshed.match.status === "RUNNING") {
                await applyTurnStartEffects(matchId, prevTurn, refreshed.match.currentTurn!);
            }
        } catch (e: any) {
            setPlaceMsg(e?.message ?? "Action failed.");
        } finally {
            setPlacing(false);
        }
    }

    async function refreshAll(id: number) {
        const b = await getBoard(id);
        setBoard(b);

        const m = await getMatch(id);
        setMatchStatus(m.status);

        // IMPORTANT: only take backend currentTurn in RUNNING
        if (m.status === "RUNNING") {
            setCurrentTurn(m.currentTurn ?? 1);
        }

        const p = await getPlayers(id);
        setPlayers(p);

        return { board: b, match: m, players: p };
    }

    async function fetchAi() {
        if (!matchId) return;
        setAiError(null);
        setAiLoading(true);
        try {
            const rec = await getAiRecommendation({
                matchId,
                playerSeat: currentTurn, // or yourPlayerSeat if you track it
            });
            setAiRec(rec);
        } catch (e: any) {
            setAiError(e?.message ?? "Failed to load AI recommendation.");
        } finally {
            setAiLoading(false);
        }
    }

    function toggleAi() {
        // open -> fetch; close -> just collapse
        setAiOpen((open) => {
            const next = !open;
            if (next) fetchAi();
            return next;
        });
    }

    if (error) {
        return (
            <main style={styles.page}>
                <div style={styles.card}>
                    <p style={styles.error}>{error}</p>
                    <div style={styles.actions}>
                        <button style={styles.linkBtn} onClick={() => router.push("/profile")}>
                            View profile
                        </button>
                        <button style={styles.linkBtn} onClick={() => router.push("/lobby")}>
                            Back to lobby
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    if (loading || !board) {
        return <main style={styles.loading}>Loading…</main>;
    }

    return (
        <main style={styles.page}>
            <section style={styles.card}>
                <div style={styles.topRow}>
                    <h1 style={styles.h1}>Game</h1>
                    <div style={styles.actions}>
                    <button style={styles.linkBtn} onClick={() => router.push("/profile")}>
                        View profile
                    </button>
                    <button style={styles.linkBtn} onClick={() => router.push("/lobby")}>
                        Back to lobby
                    </button>
                    </div>
                </div>

                <div style={styles.layout}>

                    {/* BOARD */}
                    <div
                        style={{
                            ...styles.grid,
                            gridTemplateColumns: `repeat(${board.width}, 120px)`,
                        }}
                    >
                        {Array.from({length: board.height}).map((_, y) =>
                            Array.from({length: board.width}).map((__, x) => {
                                const cell = cellMap.get(`${x},${y}`);
                                const region = cell?.region ?? "SKY";

                                const isSelected = selected?.x === x && selected?.y === y;

                                return (
                                    <button
                                        type="button"
                                        key={`${x}-${y}`}
                                        onClick={() => setSelected({x, y})}
                                        style={{
                                            ...styles.cellBtn,
                                            background: regionColor[region],
                                            outline: isSelected ? "3px solid #000" : "none",
                                        }}
                                        title={
                                            cell
                                                ? `(${x},${y}) • ${cell.region} • seat ${cell.ownerSeat} • hits ${cell.hits}`
                                                : `(${x},${y})`
                                        }
                                    >
                                        {/* show ownerSeat if present */}
                                        {cell?.ownerSeat ? (
                                            <span style={styles.seatBadge}>{cell.ownerSeat}</span>
                                        ) : null}
                                    </button>
                                );
                            })
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <aside style={styles.sidebar}>
                        <div style={styles.sidebarBlock}>
                            <div style={styles.sidebarTitle}>Current turn</div>
                            <div style={styles.sidebarValue}>
                                {currentTurn ? `Seat ${currentTurn}` : "Unknown (need endpoint)"}
                            </div>
                        </div>

                        <div style={styles.sidebarBlock}>
                            <div style={styles.sidebarTitle}>Selected cell</div>
                            <div style={styles.sidebarValue}>
                                {selected ? `x=${selected.x}, y=${selected.y}` : "None"}
                            </div>
                        </div>
                        {matchStatus === "PENDING" ? (
                            <button style={styles.button} disabled={placing} onClick={onPlaceHouse}>
                                {placing ? "Placing…" : "Place starting house"}
                            </button>
                        ) : (
                            <>
                                <button style={styles.button} onClick={onBuild}>
                                    Build house
                                </button>
                                <button style={styles.button} onClick={onAttack}>
                                    Attack
                                </button>
                                <button style={styles.button} onClick={onEndTurn}>
                                    End turn
                                </button>
                            </>
                        )}


                        {placeMsg && <p style={styles.msgBox}>{placeMsg}</p>}

                        {/* LEGEND */}
                        <div style={styles.legend}>
                            {(
                                Object.keys(regionColor) as Array<keyof typeof regionColor>
                            ).map((r) => (
                                <div key={r} style={styles.legendItem}>
                                    <span style={{...styles.swatch, background: regionColor[r]}}/>
                                    <span>{r}</span>
                                </div>
                            ))}
                        </div>
                    </aside>
                    <div style={styles.resourcesPanel}>
                        <div style={styles.resourcesTitle}>Resources</div>

                        <div style={styles.resourcesTable}>
                            <div style={styles.resourcesHeader}>
                                <div>Seat</div>
                                <div>Alive</div>
                                <div>⚡</div>
                                <div>Wood</div>
                                <div>Stone</div>
                                <div>Glass</div>
                                <div>Force</div>
                            </div>

                            {players
                                .slice()
                                .sort((a, b) => a.seat - b.seat)
                                .map((p) => (
                                    <div key={p.id} style={styles.resourcesRow}>
                                        <div>{p.seat}</div>
                                        <div>{p.alive ? "Yes" : "No"}</div>
                                        <div>{p.lightning}</div>
                                        <div>{p.wood}</div>
                                        <div>{p.stone}</div>
                                        <div>{p.glass}</div>
                                        <div>{p.force}</div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </section>
            {/* Fixed AI panel at the very left edge of the viewport */}
            <aside
                aria-hidden={!aiOpen}
                // keep it outside the normal layout visually
                style={{
                    ...styles.aiFixedPanel,
                    width: aiOpen ? 300 : 48,
                    transition: "width 220ms ease",
                }}
            >
                <button
                    type="button"
                    onClick={() => {
                        // toggle and fetch when opening
                        setAiOpen((open) => {
                            const next = !open;
                            if (next) fetchAi();
                            return next;
                        });
                    }}
                    aria-expanded={aiOpen}
                    style={styles.aiToggleFixed}
                    title={aiOpen ? "Collapse AI panel" : "Open AI panel"}
                >
                    {aiOpen ? "AI ◀" : "AI"}
                </button>

                {/* Only render the heavy content when open */}
                {aiOpen && (
                    <div style={styles.aiFixedBody}>
                        <div style={styles.aiHeaderRow}>
                            <div style={styles.aiTitle}>AI Recommendation</div>
                            <button
                                type="button"
                                onClick={fetchAi}
                                disabled={aiLoading || !matchId}
                                style={styles.aiRefresh}
                            >
                                {aiLoading ? "Loading…" : "Refresh"}
                            </button>
                        </div>

                        <div style={styles.aiMeta}>Match {matchId} • Seat {currentTurn}</div>

                        {aiError && <div style={styles.aiError}>{aiError}</div>}

                        {!aiError && !aiRec && !aiLoading && (
                            <div style={styles.aiEmpty}>No recommendation loaded.</div>
                        )}

                        {aiRec && (
                            <div style={styles.aiCard}>
                                <div style={styles.aiLabel}>Suggested action</div>
                                <div style={styles.aiValue}>{aiRec.suggestedAction}</div>

                                <div style={styles.aiLabel}>Recommendation</div>
                                <div style={styles.aiText}>{aiRec.recommendation}</div>

                                <div style={styles.aiLabel}>Description</div>
                                <div style={styles.aiText}>{aiRec.description}</div>

                                <div style={styles.aiStats}>
                                    <div>
                                        <span style={styles.aiStatLabel}>Confidence:</span> {aiRec.confidence}
                                    </div>
                                    <div>
                                        <span style={styles.aiStatLabel}>Score:</span> {aiRec.score}
                                    </div>
                                </div>

                                {aiRec.payload !== null && (
                                    <>
                                        <div style={styles.aiLabel}>Payload</div>
                                        <pre style={styles.aiCode}>{JSON.stringify(aiRec.payload, null, 2)}</pre>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </aside>


        </main>
    );
};

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#fff",
        color: "#000",
        padding: 16,
        fontFamily:
            'system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    card: {
        width: "100%",
        maxWidth: 1200,
        border: "1px solid #000",
        padding: 16,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        flex: 1, // allow it to grow
    },
    topRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    h1: {margin: 0, fontSize: 22, fontWeight: 700},
    linkBtn: {
        border: "1px solid #000",
        background: "#fff",
        color: "#000",
        padding: "6px 10px",
        cursor: "pointer",
    },
    meta: {marginTop: 10, marginBottom: 10, fontSize: 14},
    grid: {
        display: "grid",
        gap: 4,
        border: "1px solid #000",
        padding: 8,
        width: "100%",
        flex: 1,
        alignContent: "start",
        justifyContent: "start",
        overflow: "auto",
    },
    legend: {
        marginTop: "auto",
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        borderTop: "1px solid #000",
        paddingTop: 10,
        fontSize: 13,
    },
    cell: {
        width: 170,
        height: 170,
        border: "1px solid #000",
        boxSizing: "border-box",
    },
    cellText: {
        fontSize: 7.5,
        lineHeight: 1.1,
        textAlign: "center",
        userSelect: "none",
    },
    cellSub: {opacity: 0.9},
    legendItem: {display: "flex", alignItems: "center", gap: 6},
    swatch: {width: 14, height: 14, border: "1px solid #000"},
    error: {border: "1px solid #000", padding: 8, marginTop: 12 },
    layout: { display: "grid", gridTemplateColumns: "1fr 280px", gap: 12, alignItems: "start", flex: 1, minHeight: 0, },
    cellBtn: {
        width: 120,
        height: 120,
        border: "1px solid #000",
        padding: 0,
        cursor: "pointer",
        boxSizing: "border-box",
        position: "relative",
    },
    seatBadge: {
        position: "absolute",
        top: 4,
        left: 4,
        fontSize: 12,
        background: "#fff",
        border: "1px solid #000",
        padding: "0px 4px",
    },
    sidebar: {
        border: "1px solid #000",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
    },
    sidebarBlock: {
        border: "1px solid #000",
        padding: 10,
    },
    sidebarTitle: { fontSize: 12, opacity: 0.8 },
    sidebarValue: { fontSize: 16, fontWeight: 700, marginTop: 6 },
    label: { display: "grid", gap: 6, fontSize: 14 },
    input: {
        border: "1px solid #000",
        padding: "8px 10px",
        fontSize: 14,
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
    msgBox: {
        margin: 0,
        border: "1px solid #000",
        padding: 10,
        fontSize: 14,
    },
    loading: {
        width: "100vw",
        height: "100vh",
        display: "grid",
        placeItems: "center",
        fontSize: 18,
    },
    leftColumn: {
        display: "flex",
        flexDirection: "column",
        gap: 12,
        minHeight: 0,
    },
    resourcesPanel: {
        border: "1px solid #000",
        padding: 10,
    },
    resourcesTitle: {
        fontSize: 13,
        fontWeight: 700,
        marginBottom: 8,
    },
    resourcesTable: {
        display: "grid",
        gap: 6,
        fontSize: 13,
    },
    resourcesHeader: {
        display: "grid",
        gridTemplateColumns: "60px 70px 50px 60px 60px 60px 60px",
        gap: 6,
        fontWeight: 700,
        borderBottom: "1px solid #000",
        paddingBottom: 6,
    },
    resourcesRow: {
        display: "grid",
        gridTemplateColumns: "60px 70px 50px 60px 60px 60px 60px",
        gap: 6,
    },
    aiFixedPanel: {
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 9999,
        background: "#fff",
        borderRight: "1px solid #000",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "2px 0 0 rgba(0,0,0,0.03)",
    },

    aiToggleFixed: {
        border: 0,
        borderBottom: "1px solid #000",
        background: "#fff",
        color: "#000",
        height: 44,
        cursor: "pointer",
        fontWeight: 700,
        padding: "0 12px",
        textAlign: "left",
    },

    aiFixedBody: {
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        overflow: "auto",
        minHeight: 0,
    },

    /* reuse some styles from before (aiHeaderRow, aiTitle, aiRefresh, aiMeta...) */
    aiHeaderRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    aiTitle: { fontSize: 14, fontWeight: 700 },
    aiRefresh: {
        border: "1px solid #000",
        background: "#fff",
        color: "#000",
        padding: "6px 8px",
        cursor: "pointer",
        fontSize: 12,
    },
    aiMeta: { fontSize: 12, opacity: 0.8 },

    aiCard: {
        border: "1px solid #000",
        padding: 10,
        display: "flex",
        flexDirection: "column",
        gap: 8,
    },
    aiLabel: { fontSize: 12, opacity: 0.8 },
    aiValue: { fontSize: 14, fontWeight: 700 },
    aiText: { fontSize: 13, lineHeight: 1.35 },
    aiStats: {
        display: "flex",
        justifyContent: "space-between",
        gap: 10,
        fontSize: 13,
        borderTop: "1px solid #000",
        paddingTop: 8,
        marginTop: 4,
    },
    aiStatLabel: { opacity: 0.8 },
    aiCode: {
        margin: 0,
        border: "1px solid #000",
        padding: 8,
        fontSize: 11,
        overflowX: "auto",
        background: "#fff",
        color: "#000",
    },
    aiError: { border: "1px solid #000", padding: 8, fontSize: 13 },
    aiEmpty: { fontSize: 13, opacity: 0.8 },
    actions: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
};

export default GamePage;
