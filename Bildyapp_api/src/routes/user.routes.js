import { Router } from "express";
import { register, validateEmail, login,} from "../controllers/user.controller.js";
import validate from "../middleware/validate.js";
import authenticate from "../middleware/auth.middleware.js";
import { registerSchema, validationCodeSchema, loginSchema,} from "../validators/user.validator.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.put("/validation", authenticate, validate(validationCodeSchema), validateEmail);
router.post("/login", validate(loginSchema), login);

export default router;