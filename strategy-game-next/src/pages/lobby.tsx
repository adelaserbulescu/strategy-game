import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { createMatch, startMatch } from "../api/game";
import { Match } from "../models/Match";

export default function LobbyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
  if (!user) {
    router.replace("/login");
  }
}, [user, router]);

  // TODO: Fetch existing matches from API (mock or backend)
  useEffect(() => {
    // Placeholder for fetching matches
    setMatches([]);
  }, []);

  const handleCreateMatch = async () => {
  try {
    const newMatch = await createMatch(4, 5, 3, [false, false, false, false]);

    // DO NOT redirect yet
    setMatches(prev => [...prev, newMatch]);
  } catch (err) {
    console.error(err);
    alert("Failed to create match");
  }
  };

  const handleStartMatch = async (matchId: number) => {
    try {
      await startMatch(matchId);
      router.push(`/game/${matchId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to start match");
    }
  };


  const handleJoinMatch = (matchId: number) => {
    router.push(`/game/${matchId}`);
  };

  return (
    <div>
      <h1>Lobby</h1>
      <h2><button onClick={() => router.push("/profile")}>
  Profile
</button></h2>

      <button onClick={handleCreateMatch}>Create New Match</button>
      {matches.map(m => (
  <li key={m.id}>
    Match #{m.id}
    <button onClick={() => handleStartMatch(m.id)}>
      Start
    </button>
  </li>
))}

      <h3>Available Matches</h3>
      {matches.length === 0 && <p>No matches yet.</p>}
      <ul>
        {matches.map(m => (
          <li key={m.id}>
            Match #{m.id} | Status: {m.status} | Players: {m.players}
            <button onClick={() => handleJoinMatch(m.id)}>Join</button>
          </li>
        ))}
      </ul>
      {user?.role === "ADMIN" && (
        <button onClick={() => router.push("/admin")}>Admin Panel</button>
      )}
    </div>
  );
}
