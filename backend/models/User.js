import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    calorieGoal: { type: Number, default: 2000, min: 0 },
    proteinGoal: { type: Number, default: 100, min: 0 },
  },
  /** Adds createdAt & updatedAt (createdAt satisfies the spec). */
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
