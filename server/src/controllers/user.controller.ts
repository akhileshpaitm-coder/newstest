import User from "../models/User";
import Article from "../models/Article";
import mongoose from "mongoose";

export const updatePreferences = async (req: any, res: any) => {
  try {
    const { preferences } = req.body;
    if (!Array.isArray(preferences)) {
      return res.status(400).json({ message: "preferences must be an array" });
    }
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { preferences },
      { new: true }
    ).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleSave = async (req: any, res: any) => {
  try {
    const { articleId } = req.params;
    if (!mongoose.isValidObjectId(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const objId = new mongoose.Types.ObjectId(articleId);
    const idx = user.savedArticles.findIndex((id) => id.equals(objId));

    if (idx === -1) {
      user.savedArticles.push(objId);
    } else {
      user.savedArticles.splice(idx, 1);
    }

    await user.save();
    res.json({ saved: idx === -1, savedArticles: user.savedArticles });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getSavedArticles = async (req: any, res: any) => {
  try {
    const user = await User.findById(req.user.id).populate("savedArticles");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user.savedArticles);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
