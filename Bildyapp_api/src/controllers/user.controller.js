import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";
import notificationService from "../services/notification.service.js";

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );
}

export async function register(req, res, next) {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(AppError.conflict("El email ya está registrado"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const user = await User.create({
      email,
      password: hashedPassword,
      verificationCode,
      verificationAttempts: 3,
      role: "admin",
      status: "pending",
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    notificationService.emit("user:registered", {
      userId: user._id.toString(),
      email: user.email,
    });

    res.status(201).json({
      message: "Usuario registrado correctamente",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function validateEmail(req, res, next) {
  try {
    const { code } = req.body;
    const user = req.user;

    if (user.status === "verified") {
      return res.json({ message: "El usuario ya está verificado" });
    }

    if (user.verificationAttempts <= 0) {
      return next(AppError.tooManyRequests("No te quedan intentos de verificación"));
    }

    if (user.verificationCode !== code) {
      user.verificationAttempts -= 1;
      await user.save();

      if (user.verificationAttempts <= 0) {
        return next(AppError.tooManyRequests("Has agotado los intentos de verificación"));
      }

      return next(
        AppError.badRequest(
          `Código incorrecto. Intentos restantes: ${user.verificationAttempts}`
        )
      );
    }

    user.status = "verified";
    user.verificationCode = "";
    await user.save();

    notificationService.emit("user:verified", {
      userId: user._id.toString(),
      email: user.email,
    });

    res.json({
      message: "Email validado correctamente",
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password +refreshToken");

    if (!user) {
      return next(AppError.unauthorized("Credenciales incorrectas"));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return next(AppError.unauthorized("Credenciales incorrectas"));
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: "Login correcto",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
}