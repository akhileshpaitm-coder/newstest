import mongoose, { Schema } from "mongoose";

const ArticleSchema = new Schema(
  {
    title: String,
    description: String,
    link: { type: String, unique: true },
    linkHash: { type: String, unique: true, index: true },
    publicationDate: { type: Date, index: true },
    category: { type: String, index: true },
    sourceAgent: { type: Schema.Types.ObjectId, ref: "Agent" }
  },
  { timestamps: true }
);

ArticleSchema.index({ publicationDate: -1 });

export default mongoose.model("Article", ArticleSchema);