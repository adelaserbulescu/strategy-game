import axios from "axios";

const GAME_ENGINE_URL = process.env.GAME_ENGINE_URL || "http://localhost:8080";
const GAME_ENGINE_TOKEN = process.env.GAME_ENGINE_TOKEN || "";

const client = axios.create({
  baseURL: GAME_ENGINE_URL,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
    ...(GAME_ENGINE_TOKEN && { Authorization: `Bearer ${GAME_ENGINE_TOKEN}` })
  }
});

/**
 * Fetch complete match state including board and players
 * @param {number} matchId - The match ID
 * @param {number} playerSeat - The seat number of the requesting player
 * @returns {Promise<Object>} Game state with match, board, and players
 */
export async function fetchMatchState(matchId, playerSeat = null) {
  try {
    const [matchRes, boardRes, playersRes] = await Promise.all([
      client.get(`/api/matches/${matchId}`),
      client.get(`/api/board/${matchId}`),
      client.get(`/api/players/${matchId}`)
    ]);

    const match = matchRes.data;
    const board = boardRes.data;
    const players = playersRes.data;

    // Find current player if seat provided
    const currentPlayer = playerSeat 
      ? players.find(p => p.seat === playerSeat)
      : null;

    return {
      match,
      board,
      players,
      currentPlayer,
      success: true
    };
  } catch (error) {
    console.error(`Failed to fetch match state for match ${matchId}:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get just the board state
 */
export async function fetchBoard(matchId) {
  try {
    const response = await client.get(`/api/board/${matchId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch board for match ${matchId}:`, error.message);
    return null;
  }
}

/**
 * Get just the players/seats state
 */
export async function fetchPlayers(matchId) {
  try {
    const response = await client.get(`/api/players/${matchId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch players for match ${matchId}:`, error.message);
    return null;
  }
}

/**
 * Get just the match state
 */
export async function fetchMatch(matchId) {
  try {
    const response = await client.get(`/api/matches/${matchId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch match ${matchId}:`, error.message);
    return null;
  }
}

/**
 * Trigger resource gain for a match
 */
export async function triggerResourceGain(matchId) {
  try {
    const response = await client.post(`/api/resources/${matchId}/resource-gain`);
    return response.data;
  } catch (error) {
    console.error(`Failed to trigger resource gain for match ${matchId}:`, error.message);
    return null;
  }
}

/**
 * Trigger lightning recharge
 */
export async function triggerLightningRecharge(matchId) {
  try {
    const response = await client.post(`/api/resources/${matchId}/lightning-recharge`);
    return response.data;
  } catch (error) {
    console.error(`Failed to trigger lightning recharge for match ${matchId}:`, error.message);
    return null;
  }
}

export default {
  fetchMatchState,
  fetchBoard,
  fetchPlayers,
  fetchMatch,
  triggerResourceGain,
  triggerLightningRecharge
};
