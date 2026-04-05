class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Solicitud inválida") {
    return new AppError(message, 400, "BAD_REQUEST");
  }

  static unauthorized(message = "No autorizado") {
    return new AppError(message, 401, "UNAUTHORIZED");
  }

  static forbidden(message = "Acceso prohibido") {
    return new AppError(message, 403, "FORBIDDEN");
  }

  static notFound(message = "Recurso no encontrado") {
    return new AppError(message, 404, "NOT_FOUND");
  }

  static conflict(message = "Conflicto") {
    return new AppError(message, 409, "CONFLICT");
  }

  static tooManyRequests(message = "Demasiadas peticiones") {
    return new AppError(message, 429, "RATE_LIMIT");
  }
}

export default AppError;