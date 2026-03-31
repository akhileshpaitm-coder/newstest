import { Router } from "express";
import {
  getAds, createAd, updateAd, deleteAd,
  getCampaignStats,
  trackView, trackClick
} from "../controllers/ad.controller";
import { authMiddleware, adminOnly } from "../middlewares/auth";

const router = Router();

// User tracking (any authenticated user)
router.post("/view", authMiddleware, trackView);
router.post("/click", authMiddleware, trackClick);

// Admin routes
router.get("/", authMiddleware, adminOnly, getAds);
router.post("/", authMiddleware, adminOnly, createAd);
router.put("/:id", authMiddleware, adminOnly, updateAd);
router.delete("/:id", authMiddleware, adminOnly, deleteAd);
router.get("/stats", authMiddleware, adminOnly, getCampaignStats);

export default router;
