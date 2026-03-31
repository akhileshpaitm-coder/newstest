import mongoose, { Schema } from "mongoose";

const AgentSchema = new Schema(
  {
    name: String,
    rssUrl: String,
    category: { type: String, index: true },
    fetchInterval: Number,
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Agent", AgentSchema);