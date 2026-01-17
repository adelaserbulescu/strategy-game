import { ACTIONS } from "./gameActions.js";
import { findBestBuildCell, findBestAttackCell } from "./gameMoveGenerator.js";

/**
 * Score an action based on current game state
 * Higher score = better action
 */
export function scoreAction(action, gameState) {
  if (!action || !gameState) return 0;

  switch (action.type) {
    case ACTIONS.BUILD:
      return scoreBuildAction(gameState);
    
    case ACTIONS.ATTACK:
      return scoreAttackAction(gameState);
    
    case ACTIONS.TRADE_OFFER:
      return scoreTradeAction(gameState);
    
    case ACTIONS.END_TURN:
      return scoreEndTurn(gameState);
    
    default:
      return 0;
  }
}

/**
 * Score BUILD action: prioritize valuable regions and resource gains
 */
function scoreBuildAction(gameState) {
  const player = gameState.player;
  const board = gameState.board;

  if (!board || !board.cells) return 5; // Base score

  const best = findBestBuildCell(board, player.seat);
  if (!best) return 0;

  return 10 + best.score;
}

/**
 * Score ATTACK action: prioritize killing weak enemies
 */
function scoreAttackAction(gameState) {
  const player = gameState.player;
  const board = gameState.board;
  const players = gameState.players;

  if (!board || !board.cells || !players) return 0;

  const best = findBestAttackCell(board, players, player.seat);
  if (!best) return 0;

  // Lightning is valuable, only attack if worthwhile
  return 8 + best.score;
}

/**
 * Score TRADE action: only good if we need resources
 */
function scoreTradeAction(gameState) {
  const player = gameState.player;

  if (!player || !player.resources) return 2;

  // Low priority unless badly imbalanced
  let deficitCount = 0;
  const threshold = 1;

  if ((player.resources.WOOD || 0) < threshold) deficitCount++;
  if ((player.resources.STONE || 0) < threshold) deficitCount++;
  if ((player.resources.GLASS || 0) < threshold) deficitCount++;
  if ((player.resources.FORCE || 0) < threshold) deficitCount++;

  // Only trade if multiple resource deficits
  return deficitCount >= 2 ? 6 : 2;
}

/**
 * Score END_TURN: lowest priority unless nothing else viable
 */
function scoreEndTurn(gameState) {
  // Very low score, only taken when no better action
  return 1;
}
  