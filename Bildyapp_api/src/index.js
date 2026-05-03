import http from "node:http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import app from "./app.js";
import config from "./config/index.js";
import { setIo } from "./services/socket.service.js";

async function startServer() {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log("MongoDB connected");

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: "*",
      },
    });

    setIo(io);

    io.on("connection", (socket) => {
      console.log("🔌 Usuario conectado por Socket.IO:", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ Usuario desconectado:", socket.id);
      });
    });

    server.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error.message);
    process.exit(1);
  }
}

startServer();