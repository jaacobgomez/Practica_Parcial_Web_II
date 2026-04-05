import express from "express";
import errorHandler from "./middleware/error-handler.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "BildyApp API running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

export default app;