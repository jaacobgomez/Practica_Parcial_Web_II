function errorHandler(err, req, res, next) {
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: true,
      message: err.message,
      code: err.code,
    });
  }

  console.error("Error:", err);

  return res.status(500).json({
    error: true,
    message: "Error interno del servidor",
    code: "INTERNAL_ERROR",
  });
}

export default errorHandler;