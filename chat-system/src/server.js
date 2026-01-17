import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import chatSocket from "./sockets/chat.socket.js";
import aiRoutes from "./routes/ai.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/chat", aiRoutes);
app.use("/api/auth", authRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

chatSocket(io);

server.listen(3000, () => {
  console.log("Chat System running on port 3000");
});
