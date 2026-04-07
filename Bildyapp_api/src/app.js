import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import errorHandler from "./middleware/error-handler.js";
import userRoutes from "./routes/user.routes.js";

const app = express();


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: true,
    message: "Demasiadas peticiones, inténtalo más tarde",
  },
});

app.use(helmet());
app.use(limiter);
app.use(express.json());
//app.use(mongoSanitize({replaceWith: "_"}));
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "BildyApp API running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/user", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: true,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);

export default app;