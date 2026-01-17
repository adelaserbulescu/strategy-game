import { recommendGameAction } from "../ai/gameAI.js";
import { fetchMatchState } from "../services/gameEngineClient.js";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "change_this_secret";

export default function chatSocket(io) {
  // Simple socket auth using JWT passed in handshake auth: { token }
  io.use((socket, next) => {
    const token = socket.handshake?.auth?.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const payload = jwt.verify(token, SECRET);
      socket.user = payload;
      return next();
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {

    // Player joins a match chat room
    socket.on("joinRoom", ({ matchId }) => {
      socket.join(matchId);

      io.to(matchId).emit("systemMessage", {
        type: "SYSTEM",
        content: "A player joined the chat",
        timestamp: new Date()
      });
    });

    // Player sends a normal chat message (uses authenticated user)
    socket.on("sendMessage", ({ matchId, content }) => {
      const message = {
        type: "PLAYER",
        senderId: socket.user.id,
        senderName: socket.user.name,
        content,
        timestamp: new Date()
      };

      io.to(matchId).emit("newMessage", message);
    });

    // 🧠 AI MESSAGE HANDLER - now supports fetching from game engine
    socket.on("aiMessage", async ({ matchId, gameState, playerSeat }) => {
      try {
        let state = gameState;

        // If matchId provided without gameState, fetch from engine
        if (matchId && !gameState) {
          const fetchResult = await fetchMatchState(matchId, playerSeat);
          
          if (fetchResult.success) {
            state = {
              match: fetchResult.match,
              board: fetchResult.board,
              players: fetchResult.players,
              player: fetchResult.currentPlayer,
              matchId
            };
          }
        }

        // Validate state
        if (!state || !state.player) {
          socket.emit("aiError", {
            error: "Invalid game state",
            message: "Unable to generate AI recommendation"
          });
          return;
        }

        // Get AI recommendation
        const aiResult = recommendGameAction(state);

        const aiMessage = {
          type: "AI",
          content: aiResult.recommendation,
          suggestedAction: aiResult.suggestedAction,
          confidence: aiResult.confidence,
          score: aiResult.score,
          timestamp: new Date()
        };

        // Send only to the requesting player
        socket.emit("aiResponse", aiMessage);
      } catch (error) {
        console.error("AI socket error:", error);
        socket.emit("aiError", {
          error: "Failed to generate recommendation",
          message: error.message
        });
      }
    });

    socket.on("leaveRoom", ({ matchId }) => {
      socket.leave(matchId);
    });
  });
}
