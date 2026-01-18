import { Board as BoardType, Cell } from "../../models/Board";

type BoardProps = {
  board: BoardType;
  onCellClick?: (cell: Cell) => void;
};

export default function Board({ board, onCellClick }: BoardProps) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${board.width}, 50px)` }}>
      {board.cells.map(cell => (
<div key={`${cell.x}-${cell.y}`} onClick={() => onCellClick?.(cell)} style={{ border: "1px solid black", height: 50, width: 50, background: cell.ownerSeat === -1 ? "#111" : cell.ownerSeat === 1 ? "#2e7d32" : "#b71c1c", color: "white" }}>
</div>
      ))}
    </div>
  );
}
