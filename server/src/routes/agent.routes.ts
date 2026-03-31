import { Router } from "express";
import { getAgents, createAgent, updateAgent, deleteAgent } from "../controllers/agent.controller";
import { authMiddleware, adminOnly } from "../middlewares/auth";

const router = Router();

router.use(authMiddleware, adminOnly);

router.get("/", getAgents);
router.post("/", createAgent);
router.put("/:id", updateAgent);
router.delete("/:id", deleteAgent);

export default router;
