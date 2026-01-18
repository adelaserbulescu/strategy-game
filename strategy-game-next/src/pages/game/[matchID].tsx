// src/pages/game/[matchId].tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getBoard, getPlayers } from "../../api/game";
import { Board as BoardType } from "../../models/Board";
import { Player } from "../../models/Player";
import { Cell } from "../../models/Board";
import Board from "../../components/game/Board";
import PlayerList from "../../components/game/PlayerList";
import { buildCell } from "../../api/game";
import { endTurn } from "../../api/game";
import ChatPanel from "../../components/chat/ChatPanel";
import { attackCell } from "../../api/actions";
import { resourceGain, lightningRecharge } from "../../api/resources";
import { listTrades } from "../../api/trades";
import { acceptTrade } from "../../api/trades";
import { TradeOffer } from "../../models/Trade";


export default function GamePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [board, setBoard] = useState<BoardType | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<Cell | null>(null);
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [trades, setTrades] = useState<TradeOffer[]>([]);
  const { matchId } = router.query;




  useEffect(() => {
    // 🔑 WAIT for router to be ready
    if (!router.isReady) return;

    // 🔑 SAFE to read matchId now
    const matchId = Number(router.query.matchId);

    if (!user) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const b = await getBoard(matchId);
        const p = await getPlayers(matchId);
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
  }, [router.isReady, user]);

  useEffect(() => {
  if (!router.isReady || !matchId) return;
  listTrades(Number(matchId), "OPEN").then(setTrades);
}, [router.isReady, matchId]);

  if (loading) return <p>Loading game...</p>;
  if (!board) return <p>Board not found.</p>;

  const handleCellClick = (cell: Cell) => {
    setSelectedCell(cell);
  };

  const handleBuild = async () => {
  if (!selectedCell || !user) return;

  try {
    const result = await buildCell(
      Number(router.query.matchId),
      selectedCell.x,
      selectedCell.y,
      1 // seat 1 = current player (for now)
    );

    setBoard(result.board);
    setPlayers(result.players);
    setSelectedCell(null);
  } catch (err: any) {
    alert(err.message);
  }
};

const refreshBoardAndPlayers = async () => {
  if (!matchId) return;

  try {
    const [b, p] = await Promise.all([
      getBoard(Number(matchId)),
      getPlayers(Number(matchId)),
    ]);

    setBoard(b);
    setPlayers(p);
  } catch (err) {
    console.error("Failed to refresh game state", err);
  }
};


const handleEndTurn = async () => {
  try {
    await resourceGain(Number(matchId));

    if (currentTurn === players.length) {
      await lightningRecharge(Number(matchId));
    }

    await endTurn(Number(matchId)); // existing endpoint
    await refreshBoardAndPlayers();
  } catch (err) {
    console.error("End turn failed", err);
  }
};

const handleAttack = async () => {
  if (!selectedCell || currentTurn === null) return;

  try {
    const res = await attackCell(
      Number(matchId),
      currentTurn,
      selectedCell.x,
      selectedCell.y
    );

    console.log("Attack:", res.message);
    await refreshBoardAndPlayers();
  } catch (err) {
    console.error("Attack failed", err);
  }
};


const handleAcceptTrade = async (tradeId: number) => {
  if (currentTurn === null) return;
  await acceptTrade(Number(matchId), tradeId, currentTurn);
  await refreshBoardAndPlayers();
};





  return (
    <div>
      <h1>Match #{router.query.matchId}</h1>
      <div style={{ display: "flex", gap: 20 }}>
        <Board board={board} onCellClick={handleCellClick}/>
        {selectedCell && (
  <p>
    Selected cell: ({selectedCell.x}, {selectedCell.y}) {" "}
    {selectedCell.region}
  </p>
)}
<button
  onClick={handleBuild}
  disabled={!selectedCell}
>
  Build
</button>
<button onClick={handleEndTurn}>
  End Turn (Current: Player {currentTurn})
</button>



        <PlayerList players={players} />
      </div>
      { router.isReady && user && <ChatPanel
        matchId={Number(matchId)} players={undefined} board={undefined} currentTurn={undefined}/>}
        <button onClick={() => router.push("/profile")}>
  Profile
</button>
<button onClick={handleAttack} disabled={!selectedCell}>
  Attack
</button>

<button onClick={handleEndTurn}>
  End Turn (Player {currentTurn})
</button>


    </div>
  );
}
