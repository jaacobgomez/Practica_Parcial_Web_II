import { sendSlackErrorNotification } from "../services/slack.service.js";

export default async function errorHandler(err, req, res, next) {
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Error interno del servidor";
  const code = err.code || "INTERNAL_ERROR";
  
  if (statusCode >= 500) {
    await sendSlackErrorNotification(
      [
        "🚨 Error 5XX en BildyApp",
        `Método: ${req.method}`,
        `Ruta: ${req.originalUrl}`,
        `Mensaje: ${message}`,
      ].join("\n")
    );
  }

  res.status(statusCode).json({
    error: true,
    message,
    code,
  });
}