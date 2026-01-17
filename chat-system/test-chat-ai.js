import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  socket.emit("joinRoom", { matchId: "test-match" });

  socket.emit("sendMessage", {
    matchId: "test-match",
    content: "What should I do?",
    sender: { id: 1, name: "Tester" }
  });

  socket.emit("aiMessage", {
    matchId: "test-match",
    gameState: {
      player: {
        id: 1,
        resources: {
          WOOD: 2,
          STONE: 1,
          GLASS: 0,
          FORCE: 1
        }
      }
    }
  });
});

socket.on("newMessage", msg => console.log("Chat:", msg));
socket.on("aiResponse", msg => console.log("AI:", msg));

