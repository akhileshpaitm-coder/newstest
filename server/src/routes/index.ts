import { Router } from "express";
import authRoutes from "./auth.routes";
import feedRoutes from "./feed.routes";
import adRoutes from "./ad.routes";
import userRoutes from "./user.routes";
import agentRoutes from "./agent.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/feed", feedRoutes);
router.use("/ads", adRoutes);
router.use("/user", userRoutes);
router.use("/agents", agentRoutes);

export default router;
