import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import errorHandler from "./middleware/error-handler.js";
import userRoutes from "./routes/user.routes.js";
import clientRoutes from "./routes/client.routes.js";
import projectRoutes from "./routes/project.routes.js";
import deliveryNoteRoutes from "./routes/deliverynote.routes.js";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";

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
//Desactivado por conflicto con la versión actual de Express 
app.use("/uploads", express.static("uploads"));
// Monto la ruta para el uso de clientes
app.use("/api/client", clientRoutes);
// Monto la ruta para el uso de proyectos
app.use("/api/project", projectRoutes);
// Monto la ruta para el uso de albaranes
app.use("/api/deliverynote", deliveryNoteRoutes);
// Monto la ruta para el uso de Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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