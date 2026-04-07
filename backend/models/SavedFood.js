import mongoose from "mongoose";

/** User-defined foods: nutrition per 100g or per 100ml only. */
const savedFoodSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    /** kcal per 100g or per 100ml (matches `unit`). */
    calories: { type: Number, required: true, min: 0 },
    /** Protein (g) per 100g or per 100ml. */
    protein: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, enum: ["100g", "100ml"] },
  },
  { timestamps: true }
);

savedFoodSchema.index({ userId: 1, name: 1 });

export default mongoose.model("SavedFood", savedFoodSchema);
