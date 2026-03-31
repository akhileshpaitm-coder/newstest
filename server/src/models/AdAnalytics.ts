import mongoose, { Schema } from "mongoose";

const AdAnalyticsSchema = new Schema(
  {
    ad: { type: Schema.Types.ObjectId, ref: "Ad", index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", index: true },
    viewed: { type: Boolean, default: false },
    clicked: { type: Boolean, default: false }
  },
  { timestamps: true }
);

AdAnalyticsSchema.index({ ad: 1, user: 1 }, { unique: true });

export default mongoose.model("AdAnalytics", AdAnalyticsSchema);