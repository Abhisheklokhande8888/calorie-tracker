import mongoose from "mongoose";
import { DEFAULT_FOOD_UNIT, FOOD_UNITS } from "../config/foodUnits.js";

const foodEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    foodName: { type: String, required: true, trim: true },
    /** Calories for this log line (per-unit × quantity). */
    calories: { type: Number, required: true, min: 0 },
    /** Protein (g) for this log line (per-unit × quantity). */
    protein: { type: Number, required: true, min: 0 },
    /** Number of units/servings (defaults to 1). */
    quantity: { type: Number, default: 1, min: 0.01 },
    /** What the per-unit calories/protein refer to (e.g. 100g, serving). */
    unit: { type: String, default: DEFAULT_FOOD_UNIT, enum: FOOD_UNITS },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("FoodEntry", foodEntrySchema);
