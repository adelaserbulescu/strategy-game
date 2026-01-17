import express from "express";
import { recommendGameAction } from "../ai/gameAI.js";
import { fetchMatchState } from "../services/gameEngineClient.js";

const router = express.Router();

/**
 * POST /api/ai/recommendation
 * Accepts either:
 * 1. Full gameState object (for backward compatibility)
 * 2. matchId and playerSeat (fetches from game engine)
 */
router.post("/ai/recommendation", async (req, res) => {
  try {
    const { gameState, matchId, playerSeat } = req.body;

    let state = gameState;

    // If matchId provided, fetch from game engine
    if (matchId && !gameState) {
      const fetchResult = await fetchMatchState(matchId, playerSeat);
      
      if (!fetchResult.success) {
        return res.status(400).json({
          error: "Failed to fetch game state",
          details: fetchResult.error
        });
      }

      // Build game state from fetched data
      state = {
        match: fetchResult.match,
        board: fetchResult.board,
        players: fetchResult.players,
        player: fetchResult.currentPlayer,
        matchId
      };
    }

    // Validate state
    if (!state || !state.player) {
      return res.status(400).json({
        error: "Invalid game state",
        message: "Missing player or gameState"
      });
    }

    // Get AI recommendation
    const recommendation = recommendGameAction(state);

    res.json(recommendation);
  } catch (error) {
    console.error("AI recommendation error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

export default router;
