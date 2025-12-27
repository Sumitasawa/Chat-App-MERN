import express from "express";
import "dotenv/config";
import http from "http";
import cors from "cors";
import { db } from "./dbconfig/db.config.js";
import userRouter from "./Routes/user.Routes.js";
import messageRouter from "./Routes/message.Routes.js";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

/* SOCKET.IO SETUP */
export const io = new Server(server, {
  cors: {
    origin: "*", // restrict in production
  },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;

  if (!userId) {
    console.log("Socket connected without userId");
    return;
  }

  console.log("User connected:", userId);

  // store socket id
  userSocketMap[userId] = socket.id;

  // send online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

/*MIDDLEWARES */
app.use(express.json({ limit: "4mb" }));
app.use(cors());

/* ROUTES */
app.get("/api/status", (req, res) => {
  res.status(200).json({ success: true, message: "Server is live 🚀" });
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

/* ERROR HANDLER */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/*  START SERVER */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await db();
    console.log("Database connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
