import Agent from "../models/Agent";

export const getAgents = async (_req: any, res: any) => {
  try {
    const agents = await Agent.find().sort({ createdAt: -1 });
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createAgent = async (req: any, res: any) => {
  try {
    const { name, rssUrl, category, fetchInterval, active } = req.body;
    const agent = await Agent.create({ name, rssUrl, category, fetchInterval, active });
    res.status(201).json(agent);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAgent = async (req: any, res: any) => {
  try {
    const agent = await Agent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAgent = async (req: any, res: any) => {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json({ message: "Agent deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
