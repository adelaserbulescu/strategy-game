import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  socket.emit("joinRoom", { matchId: "test-match" });
});

socket.on("newMessage", msg => console.log("P2 sees:", msg));
