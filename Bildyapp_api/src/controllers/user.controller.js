import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";
import notificationService from "../services/notification.service.js";
import Company from "../models/Company.js";

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

export async function updatePersonalData(req, res, next) {
  try {
    const { name, lastName, nif, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        lastName,
        nif,
        ...(address && { address }),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("company");

    res.json({
      message: "Datos personales actualizados correctamente",
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCompanyData(req, res, next) {
  try {
    const { name, cif, address, isFreelance } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(AppError.notFound("Usuario no encontrado"));
    }

    let company;

    if (isFreelance) {
      if (!user.nif) {
        return next(
          AppError.badRequest("Para ser autónomo, el usuario debe tener NIF")
        );
      }

      company = await Company.findOne({ cif: user.nif });

      if (!company) {
        company = await Company.create({
          owner: user._id,
          name: `${user.name} ${user.lastName}`.trim(),
          cif: user.nif,
          address: user.address || {},
          isFreelance: true,
        });
      }

      user.company = company._id;
      user.role = "admin";
      await user.save();

      return res.json({
        message: "Compañía de autónomo configurada correctamente",
        company,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          company: user.company,
        },
      });
    }

    company = await Company.findOne({ cif });

    if (!company) {
      company = await Company.create({
        owner: user._id,
        name,
        cif,
        address: address || {},
        isFreelance: false,
      });

      user.role = "admin";
    } else {
      user.role = "guest";
    }

    user.company = company._id;
    await user.save();

    res.json({
      message: "Datos de compañía actualizados correctamente",
      company,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        company: user.company,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const user = await User.findById(req.user._id).populate("company");

    if (!user) {
      return next(AppError.notFound("Usuario no encontrado"));
    }

    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req, res, next) {
  try {
    const { refreshToken } = req.body;

    let decoded;

    try {
      decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
    } catch (error) {
      return next(AppError.unauthorized("Refresh token inválido o expirado"));
    }

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || !user.refreshToken) {
      return next(AppError.unauthorized("Refresh token inválido"));
    }

    if (user.refreshToken !== refreshToken) {
      return next(AppError.unauthorized("Refresh token no válido"));
    }

    const newAccessToken = generateAccessToken(user);

    res.json({
      message: "Nuevo access token generado correctamente",
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select("+refreshToken");

    if (!user) {
      return next(AppError.notFound("Usuario no encontrado"));
    }

    user.refreshToken = "";
    await user.save();

    res.json({
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return next(AppError.notFound("Usuario no encontrado"));
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return next(AppError.unauthorized("La contraseña actual no es correcta"));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.json({
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { soft } = req.query;

    const user = await User.findById(req.user._id);

    if (!user) {
      return next(AppError.notFound("Usuario no encontrado"));
    }

    if (soft === "true") {
      user.deleted = true;
      await user.save();

      notificationService.emit("user:deleted", {
        userId: user._id.toString(),
        email: user.email,
        mode: "soft",
      });

      return res.json({
        message: "Usuario eliminado lógicamente",
      });
    }

    await User.findByIdAndDelete(req.user._id);

    notificationService.emit("user:deleted", {
      userId: user._id.toString(),
      email: user.email,
      mode: "hard",
    });

    res.json({
      message: "Usuario eliminado definitivamente",
    });
  } catch (error) {
    next(error);
  }
}

export async function inviteUser(req, res, next) {
  try {
    const { email, password } = req.body;

    const adminUser = await User.findById(req.user._id);

    if (!adminUser) {
      return next(AppError.notFound("Usuario no encontrado"));
    }

    if (!adminUser.company) {
      return next(AppError.badRequest("Debes tener una compañía asociada para invitar usuarios"));
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return next(AppError.conflict("El email ya está registrado"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const invitedUser = await User.create({
      email,
      password: hashedPassword,
      verificationCode,
      verificationAttempts: 3,
      role: "guest",
      status: "pending",
      company: adminUser.company,
    });

    notificationService.emit("user:invited", {
      userId: invitedUser._id.toString(),
      email: invitedUser.email,
      invitedBy: adminUser.email,
    });

    res.status(201).json({
      message: "Usuario invitado correctamente",
      user: {
        id: invitedUser._id,
        email: invitedUser.email,
        role: invitedUser.role,
        status: invitedUser.status,
        company: invitedUser.company,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadCompanyLogo(req, res, next) {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(AppError.notFound("Usuario no encontrado"));
    }

    if (!user.company) {
      return next(AppError.badRequest("El usuario no tiene una compañía asociada"));
    }

    if (!req.file) {
      return next(AppError.badRequest("Debes subir un archivo de imagen"));
    }

    const company = await Company.findById(user.company);

    if (!company) {
      return next(AppError.notFound("Compañía no encontrada"));
    }

    company.logo = `${config.baseUrl}/uploads/${req.file.filename}`;
    await company.save();

    res.json({
      message: "Logo subido correctamente",
      logo: company.logo,
      company,
    });
  } catch (error) {
    next(error);
  }
}