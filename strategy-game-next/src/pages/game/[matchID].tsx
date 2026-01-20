import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

import { getBoard, getPlayers, buildCell, endTurn } from "../../api/game";
import { attackCell } from "../../api/actions";
import { resourceGain, lightningRecharge } from "../../api/resources";
import { listTrades, acceptTrade } from "../../api/trades";

import { Board as BoardType, Cell } from "../../models/Board";
import { Player } from "../../models/Player";
import { TradeOffer } from "../../models/Trade";

import Board from "../../components/game/Board";
import PlayerList from "../../components/game/PlayerList";
import ChatPanel from "../../components/chat/ChatPanel";

export default function GamePage() {
  const router = useRouter();
  const { user } = useAuth();

  let matchId: number | null =
    router.isReady && typeof router.query.matchId === "string"
      ? parseInt(router.query.matchId)
      : null;

  const [board, setBoard] = useState<BoardType>();
  const [players, setPlayers] = useState<Player[]>([]);
  const [trades, setTrades] = useState<TradeOffer[]>([]);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /* -----------------------------
     Initial load
  -------------------------------- */
  useEffect(() => {
  if (!router.isReady) return;

  if (!user) {
    router.replace("/login");
    return;
  }

  if (matchId === null || Number.isNaN(matchId)) {
    matchId = router.isReady && typeof router.query.matchId === "string"
      ? parseInt(router.query.matchId)
      : null;
    setLoading(false);
    return;
  }

  console.log("Loading game for matchId:", matchId);

  const fetchData = async () => {
    try {
      const [b, p] = await Promise.all([
        getBoard(matchId!),
        getPlayers(matchId!),
      ]);


      setBoard(b);
      setPlayers(p);
      setCurrentTurn(1);
    } catch (err) {
      console.error("Failed to fetch game data:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [router.isReady, matchId, user]);


  /* -----------------------------
     Trades
  -------------------------------- */
  /*useEffect(() => {
    if (!router.isReady || matchId === null) matchId = router.isReady && typeof router.query.matchId === "string"
      ? parseInt(router.query.matchId)
      : null;
    listTrades(matchId!, "OPEN").then(setTrades).catch(console.error);
  }, [router.isReady, matchId]);*/

  /* -----------------------------
     Helpers
  -------------------------------- */
  const refreshBoardAndPlayers = async () => {
    if (matchId === null) matchId = router.isReady && typeof router.query.matchId === "string"
      ? parseInt(router.query.matchId)
      : null;

    const [b, p] = await Promise.all([
      getBoard(matchId!),
      getPlayers(matchId!),
    ]);

    setBoard(b);
    setPlayers(p);
  };

  /* -----------------------------
     Actions
  -------------------------------- */
  const handleBuild = async () => {
    if (!selectedCell || !user || matchId === null) return;

    try {
      const result = await buildCell(
        matchId,
        selectedCell.x,
        selectedCell.y,
        1 // TODO: replace with real seat
      );

      setBoard(result.board);
      setPlayers(result.players);
      setSelectedCell(null);
    } catch (err: any) {
      alert(err.message ?? "Build failed");
    }
  };

  const handleEndTurn = async () => {
    if (matchId === null || currentTurn === null) return;

    try {
      await resourceGain(matchId);

      if (currentTurn === players.length) {
        await lightningRecharge(matchId);
      }

      await endTurn(matchId);
      await refreshBoardAndPlayers();
    } catch (err) {
      console.error("End turn failed:", err);
    }
  };

  const handleAttack = async () => {
    if (!selectedCell || currentTurn === null || matchId === null) return;

    try {
      await attackCell(
        matchId,
        currentTurn,
        selectedCell.x,
        selectedCell.y
      );

      await refreshBoardAndPlayers();
    } catch (err) {
      console.error("Attack failed:", err);
    }
  };

  const handleAcceptTrade = async (tradeId: number) => {
    if (currentTurn === null || matchId === null) return;

    await acceptTrade(matchId, tradeId, currentTurn);
    await refreshBoardAndPlayers();
  };

  /* -----------------------------
     Render
  -------------------------------- */
  if (loading) return <p>Loading game...</p>;
  if (!board) return <p>Board not found.</p>;

  return (
    <div>
      <h1>Match #{matchId}</h1>

      <div style={{ display: "flex", gap: 20 }}>
        <Board board={board} onCellClick={setSelectedCell} />

        <div>
          {selectedCell && (
            <p>
              Selected cell: ({selectedCell.x}, {selectedCell.y}){" "}
              {selectedCell.region}
            </p>
          )}

          <button onClick={handleBuild} disabled={!selectedCell}>
            Build
          </button>

          <button onClick={handleAttack} disabled={!selectedCell}>
            Attack
          </button>

          <button onClick={handleEndTurn}>
            End Turn (Player {currentTurn})
          </button>
        </div>

        <PlayerList players={players} />
      </div>

      {user && matchId !== null && (
        <ChatPanel
          matchId={matchId}
          players={undefined}
          board={undefined}
          currentTurn={undefined}
        />
      )}

      <button onClick={() => router.push("/profile")}>Profile</button>
    </div>
  );
}
