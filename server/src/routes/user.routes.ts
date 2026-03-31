import { Router } from "express";
import { updatePreferences, toggleSave, getSavedArticles } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.put("/preferences", authMiddleware, updatePreferences);
router.post("/save/:articleId", authMiddleware, toggleSave);
router.get("/saved", authMiddleware, getSavedArticles);

export default router;
