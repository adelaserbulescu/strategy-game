import { useParams } from "react-router-dom";

export default function GamePage() {
  const { matchId } = useParams();
  return <h1>Game {matchId}</h1>;
}