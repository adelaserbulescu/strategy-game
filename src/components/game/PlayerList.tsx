import { Player } from "../../models/Player";

export default function PlayerList({ players }: { players: Player[] }) {
  return (
    <ul>
      {players.map(p => (
        <li key={p.id}>
          Seat {p.seat} | {p.bot ? "Bot" : "Human"} | Wood: {p.wood} | Stone: {p.stone}
        </li>
      ))}
    </ul>
  );
}
