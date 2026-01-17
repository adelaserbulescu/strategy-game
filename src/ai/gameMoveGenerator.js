import { ACTIONS, RESOURCES, REGION_VALUES } from "./gameActions.js";

/**
 * Generate all possible valid actions for the current player
 * based on board state, resources, and game status
 */
export function getPossibleActions(gameState) {
  const actions = [];
  
  // Fallback if minimal state provided
  if (!gameState || !gameState.player) {
    return [{ type: ACTIONS.END_TURN }];
  }

  const player = gameState.player;
  const board = gameState.board;
  const players = gameState.players;
  const match = gameState.match;

  // Only generate actions if match is running
  if (match && match.status !== "RUNNING") {
    return [{ type: ACTIONS.END_TURN, description: "Match not running" }];
  }

  // Respect turn order: if it's not this player's turn, only wait/end turn
  if (match && match.currentTurn && match.currentTurn !== player.seat) {
    return [{ type: ACTIONS.END_TURN, description: "Wait for your turn" }];
  }

  // BUILD: Check if player has resources for building
  if (canBuild(player)) {
    actions.push({
      type: ACTIONS.BUILD,
      cost: { [RESOURCES.WOOD]: 1, [RESOURCES.STONE]: 1 },
      description: "Build a house on an empty cell"
    });
  }

  // ATTACK: Check if player has lightning for attacking
  if (canAttack(player, board)) {
    actions.push({
      type: ACTIONS.ATTACK,
      cost: { [RESOURCES.LIGHTNING]: 1 },
      description: "Attack an enemy house to damage it"
    });
  }

  // TRADE_OFFER: Always possible (can always offer a trade)
  actions.push({
    type: ACTIONS.TRADE_OFFER,
    description: "Propose a resource trade with another player"
  });

  // END_TURN: Always possible
  actions.push({
    type: ACTIONS.END_TURN,
    description: "End turn and pass to next player"
  });

  return actions;
}

/**
 * Check if player can build (has required resources)
 */
function canBuild(player) {
  if (!player || !player.resources) return false;
  const res = player.resources;
  return (res.WOOD || 0) >= 1 && (res.STONE || 0) >= 1;
}

/**
 * Check if player can attack (has lightning and enemies to attack)
 */
function canAttack(player, board) {
  const lightning = (player.lightning ?? player.resources?.LIGHTNING) || 0;
  if (!player || lightning < 1) return false;
  if (!board || !board.cells) return false;

  // Check if there's at least one enemy house on board
  const hasEnemyHouse = board.cells.some(cell => 
    cell.ownerSeat && cell.ownerSeat > 0 && cell.ownerSeat !== player.seat
  );

  return hasEnemyHouse;
}

/**
 * Find empty cells where building is possible
 */
export function findBuildableCells(board, playerSeat) {
  if (!board || !board.cells) return [];
  
  return board.cells.filter(cell => 
    !cell.ownerSeat || cell.ownerSeat === -1
  );
}

/**
 * Find enemy houses that can be attacked
 */
export function findAttackableCells(board, playerSeat) {
  if (!board || !board.cells) return [];
  
  return board.cells.filter(cell => 
    cell.ownerSeat && cell.ownerSeat > 0 && cell.ownerSeat !== playerSeat
  );
}

/**
 * Pick the best build cell based on region value and adjacency
 */
export function findBestBuildCell(board, playerSeat) {
  const candidates = findBuildableCells(board, playerSeat);
  let best = null;
  let bestScore = -Infinity;

  for (const cell of candidates) {
    const regionValue = REGION_VALUES[cell.region] || 1;
    const adjacentOwned = countAdjacentOwned(cell, board, playerSeat);
    let score = regionValue * 3 + adjacentOwned * 2;
    if (adjacentOwned === 0) score -= 1;

    if (score > bestScore) {
      bestScore = score;
      best = cell;
    }
  }

  return best ? { cell: best, score: bestScore } : null;
}

/**
 * Pick the best enemy house to attack
 */
export function findBestAttackCell(board, players, playerSeat) {
  const candidates = findAttackableCells(board, playerSeat);
  let best = null;
  let bestScore = -Infinity;

  for (const cell of candidates) {
    const owner = players?.find(p => p.seat === cell.ownerSeat);
    if (!owner) continue;

    let score = 0;

    if (cell.hits >= 2) score += 15;
    else if (cell.hits >= 1) score += 8;
    else score += 5;

    const targetHouses = board.cells.filter(c => c.ownerSeat === owner.seat).length;
    if (targetHouses <= 2) score += 10;
    if (targetHouses <= 1) score += 20;

    const regionValue = REGION_VALUES[cell.region] || 1;
    score += regionValue * 2;

    if (score > bestScore) {
      bestScore = score;
      best = cell;
    }
  }

  return best ? { cell: best, score: bestScore } : null;
}

function countAdjacentOwned(cell, board, playerSeat) {
  const adjacent = [
    { x: cell.x - 1, y: cell.y },
    { x: cell.x + 1, y: cell.y },
    { x: cell.x, y: cell.y - 1 },
    { x: cell.x, y: cell.y + 1 }
  ];

  let count = 0;
  for (const adj of adjacent) {
    const neighbor = board.cells.find(c => c.x === adj.x && c.y === adj.y);
    if (neighbor && neighbor.ownerSeat === playerSeat) count++;
  }
  return count;
}
