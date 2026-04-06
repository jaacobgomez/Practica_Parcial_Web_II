import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(AppError.unauthorized("Token no proporcionado"));
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(AppError.unauthorized("Formato de token inválido"));
  }

  try {
    const decoded = jwt.verify(token, config.jwtAccessSecret);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(AppError.unauthorized("Usuario no encontrado"));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(AppError.unauthorized("Token inválido o expirado"));
  }
}

export default authenticate;