import mongoose, { Schema } from "mongoose";

const AdSchema = new Schema(
  {
    title: String,
    imageUrl: String,
    targetLink: String,
    category: { type: String, index: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("Ad", AdSchema);