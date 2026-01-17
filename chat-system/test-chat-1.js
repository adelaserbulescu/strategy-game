import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  socket.emit("joinRoom", { matchId: "test-match" });

  setTimeout(() => {
    socket.emit("sendMessage", {
      matchId: "test-match",
      content: "Hi from Player 1",
      sender: { id: 1, name: "Player1" }
    });
  }, 1000);
});

socket.on("newMessage", msg => console.log("P1 sees:", msg));
