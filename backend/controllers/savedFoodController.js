import mongoose from "mongoose";
import { validationResult } from "express-validator";
import SavedFood from "../models/SavedFood.js";

export async function list(req, res) {
  try {
    const items = await SavedFood.find({ userId: req.user.id }).sort({ updatedAt: -1 }).lean();
    return res.json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not load saved foods" });
  }
}

export async function create(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }
    const { name, calories, protein, unit } = req.body;
    const doc = await SavedFood.create({
      userId: req.user.id,
      name: name.trim(),
      calories: Number(calories),
      protein: Number(protein),
      unit,
    });
    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not save food item" });
  }
}

export async function update(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const { name, calories, protein, unit } = req.body;
    const doc = await SavedFood.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      {
        name: name.trim(),
        calories: Number(calories),
        protein: Number(protein),
        unit,
      },
      { new: true, runValidators: true }
    );
    if (!doc) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not update item" });
  }
}

export async function remove(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }
    const deleted = await SavedFood.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: "Item not found" });
    }
    return res.json({ message: "Deleted", id: deleted._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Could not delete item" });
  }
}
