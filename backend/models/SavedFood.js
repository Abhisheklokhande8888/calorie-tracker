import mongoose from "mongoose";
import { FOOD_UNITS } from "../config/foodUnits.js";

/** User-defined foods: nutrition stored per selected unit. */
const savedFoodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    /** kcal per selected unit (matches `unit`). */
    calories: { type: Number, required: true, min: 0 },
    /** Protein (g) per selected unit. */
    protein: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: FOOD_UNITS },
  },
  { timestamps: true }
);

savedFoodSchema.index({ userId: 1, name: 1 });

export default mongoose.model("SavedFood", savedFoodSchema);
