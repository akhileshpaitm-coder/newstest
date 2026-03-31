import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "USER" | "ADMIN";
  preferences: string[];
  savedArticles: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, index: true },
    password: { type: String, required: true },
    role: { type: String, default: "USER" },
    preferences: [{ type: String }],
    savedArticles: [{ type: Schema.Types.ObjectId, ref: "Article" }]
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);