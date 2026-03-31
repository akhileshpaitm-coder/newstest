import { Router } from "express";
import { register, login, getMe } from "../controllers/auth.controller";
import { registerValidator, loginValidator } from "../validators/auth.validator";
import { validate } from "../middlewares/validate";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", authMiddleware, getMe);

export default router;
