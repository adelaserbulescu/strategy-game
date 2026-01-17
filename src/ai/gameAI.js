import { getPossibleActions, findBestBuildCell, findBestAttackCell } from "./gameMoveGenerator.js";
import { scoreAction } from "./gameActionEvaluator.js";

/**
 * Recommend the best game action based on current state
 * @param {Object} gameState - Current game state (match, board, players, player)
 * @returns {Object} { suggestedAction, recommendation, confidence }
 */
export function recommendGameAction(gameState) {
  if (!gameState || !gameState.player) {
    return {
      suggestedAction: "END_TURN",
      recommendation: "Insufficient game state data.",
      confidence: 0
    };
  }

  const actions = getPossibleActions(gameState);

  if (actions.length === 0) {
    return {
      suggestedAction: "END_TURN",
      recommendation: "No actions available.",
      confidence: 0
    };
  }

  // Score all actions and find the best
  let best = actions[0];
  let bestScore = scoreAction(best, gameState);

  for (const action of actions) {
    const score = scoreAction(action, gameState);
    if (score > bestScore) {
      best = action;
      bestScore = score;
    }
  }

  // Calculate confidence based on score gap
  const secondBest = actions
    .filter(a => a.type !== best.type)
    .map(a => scoreAction(a, gameState))
    .sort((a, b) => b - a)[0] || 0;

  const confidence = Math.min(100, Math.round((bestScore - secondBest) / (bestScore + 1) * 100));

  // Build payload suggestion (coordinates for build/attack)
  const payload = buildPayload(best.type, gameState);

  return {
    suggestedAction: best.type,
    recommendation: explain(best.type, gameState),
    confidence,
    score: bestScore,
    description: best.description,
    payload
  };
}

/**
 * Generate human-readable explanation for why we recommend an action
 */
function explain(action, gameState) {
  const player = gameState?.player;
  const board = gameState?.board;

  switch (action) {
    case "BUILD":
      if (board && board.cells) {
        const ownHouses = board.cells.filter(c => c.ownerSeat === player?.seat).length;
        if (ownHouses === 0) return "Building first house to establish territory.";
        return "Expanding territory to valuable regions and consolidating power.";
      }
      return "Building to expand your territory and increase resource generation.";

    case "ATTACK":
      if (board && board.cells) {
        const enemies = board.cells.filter(c => c.ownerSeat && c.ownerSeat > 0 && c.ownerSeat !== player?.seat);
        if (enemies.some(e => e.hits >= 2)) return "Finishing off a weakened enemy house.";
        if (enemies.length <= 2) return "Attacking the limited enemy forces.";
      }
      return "Attacking to eliminate enemy presence and resources.";

    case "TRADE_OFFER":
      const resources = player?.resources || {};
      const deficits = [];
      if ((resources.WOOD || 0) < 1) deficits.push("wood");
      if ((resources.STONE || 0) < 1) deficits.push("stone");
      if ((resources.GLASS || 0) < 1) deficits.push("glass");
      if ((resources.FORCE || 0) < 1) deficits.push("force");

      if (deficits.length > 0) {
        return `Trading to acquire needed resources: ${deficits.join(", ")}.`;
      }
      return "Trading to optimize resource balance.";

    case "END_TURN":
      return "No strong strategic move available; passing turn.";

    default:
      return "Action recommended.";
  }
}

function buildPayload(action, gameState) {
  if (!gameState || !gameState.board) return null;

  switch (action) {
    case "BUILD": {
      const best = findBestBuildCell(gameState.board, gameState.player?.seat);
      if (best?.cell) return { x: best.cell.x, y: best.cell.y };
      return null;
    }
    case "ATTACK": {
      const best = findBestAttackCell(gameState.board, gameState.players, gameState.player?.seat);
      if (best?.cell) return { x: best.cell.x, y: best.cell.y };
      return null;
    }
    default:
      return null;
  }
}
