import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected with ID:", socket.id);

  socket.emit("joinRoom", { matchId: "test-match" });

  socket.emit("sendMessage", {
    matchId: "test-match",
    content: "Hello from test client!",
    sender: { id: 1, name: "Tester" }
  });
});

socket.on("newMessage", msg => {
  console.log("Received message:", msg);
});

socket.on("systemMessage", msg => {
  console.log("System:", msg);
});
