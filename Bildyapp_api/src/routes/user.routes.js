import { Router } from "express";
import {register, validateEmail,login, updatePersonalData, updateCompanyData, getCurrentUser, refreshToken, logout,
    changePassword, deleteUser, inviteUser, uploadCompanyLogo
} from "../controllers/user.controller.js";
import validate from "../middleware/validate.js";
import authenticate from "../middleware/auth.middleware.js";
import authorizeRoles from "../middleware/role.middleware.js";
import upload from "../middleware/upload.js";
import { registerSchema, validationCodeSchema, loginSchema, personalDataSchema, companySchema,
    refreshTokenSchema, passwordSchemaValidator, inviteUserSchema
} from "../validators/user.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.put("/validation", authenticate, validate(validationCodeSchema), validateEmail);
router.post("/login", validate(loginSchema), login);

router.put("/register", authenticate, validate(personalDataSchema), updatePersonalData);
router.patch("/company", authenticate, validate(companySchema), updateCompanyData);
router.get("/", authenticate, getCurrentUser);

router.post("/refresh", validate(refreshTokenSchema), refreshToken);
router.post("/logout", authenticate, logout);
router.put("/password", authenticate, validate(passwordSchemaValidator), changePassword);
router.delete("/", authenticate, deleteUser);

router.post("/invite", authenticate, authorizeRoles("admin"), validate(inviteUserSchema), inviteUser);
router.patch("/logo", authenticate, upload.single("logo"), uploadCompanyLogo);

export default router;