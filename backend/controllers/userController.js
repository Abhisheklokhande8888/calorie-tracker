import { validationResult } from "express-validator";
import User from "../models/User.js";

/**
 * Return current user profile (goals included).
 */
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      calorieGoal: user.calorieGoal,
      proteinGoal: user.proteinGoal,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
}

/**
 * Update calorie and protein goals.
 */
export async function updateGoals(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }
    const { calorieGoal, proteinGoal } = req.body;
    const update = {};
    if (calorieGoal !== undefined) update.calorieGoal = Number(calorieGoal);
    if (proteinGoal !== undefined) update.proteinGoal = Number(proteinGoal);
    const user = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      calorieGoal: user.calorieGoal,
      proteinGoal: user.proteinGoal,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to update goals" });
  }
}
