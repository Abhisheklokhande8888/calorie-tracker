import mongoose from "mongoose";
import { validationResult } from "express-validator";
import { DEFAULT_FOOD_UNIT, FOOD_UNITS } from "../config/foodUnits.js";
import FoodEntry from "../models/FoodEntry.js";
import User from "../models/User.js";

/** Start/end of local calendar day for a Date (uses server local TZ). */
function dayBounds(date) {
  const d = new Date(date);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

function pct(total, goal) {
  if (!goal || goal <= 0) return 0;
  return Math.min(100, Math.round((total / goal) * 1000) / 10);
}

/**
 * Add a food entry for the authenticated user.
 */
export async function addFood(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }
    const { foodName, calories, protein, date, quantity: qtyRaw, unit: unitRaw } = req.body;
    const qty =
      qtyRaw !== undefined && qtyRaw !== null && qtyRaw !== ""
        ? Number(qtyRaw)
        : 1;
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }
    const unit = FOOD_UNITS.includes(unitRaw) ? unitRaw : DEFAULT_FOOD_UNIT;
    const perCal = Number(calories);
    const perProt = Number(protein);
    const entry = await FoodEntry.create({
      userId: req.user.id,
      foodName: foodName.trim(),
      calories: Math.round(perCal * qty * 100) / 100,
      protein: Math.round(perProt * qty * 100) / 100,
      quantity: Math.round(qty * 1000) / 1000,
      unit,
      date: date ? new Date(date) : new Date(),
    });
    return res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to add food entry" });
  }
}

/**
 * Today's totals vs goals with percentage completion.
 */
export async function getToday(req, res) {
  try {
    const { start, end } = dayBounds(new Date());
    const user = await User.findById(req.user.id).select("calorieGoal proteinGoal");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const entries = await FoodEntry.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalCalories = entries.reduce((s, e) => s + e.calories, 0);
    const totalProtein = entries.reduce((s, e) => s + e.protein, 0);
    const calorieGoal = user.calorieGoal ?? 2000;
    const proteinGoal = user.proteinGoal ?? 100;

    return res.json({
      date: start.toISOString().slice(0, 10),
      entries,
      totals: {
        calories: totalCalories,
        protein: totalProtein,
      },
      goals: {
        calorieGoal,
        proteinGoal,
      },
      progress: {
        caloriesPercent: pct(totalCalories, calorieGoal),
        proteinPercent: pct(totalProtein, proteinGoal),
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load today's food" });
  }
}

/**
 * History grouped by date with optional pagination.
 * Query: page (default 1), limit (default 10) — pages are over distinct dates.
 */
export async function getHistory(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

    const tz = process.env.TZ || "UTC";
    const pipeline = [
      { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: tz },
          },
          items: { $push: "$$ROOT" },
          dayCalories: { $sum: "$calories" },
          dayProtein: { $sum: "$protein" },
        },
      },
      {
        $project: {
          dateLabel: "$_id",
          items: 1,
          dayCalories: 1,
          dayProtein: 1,
        },
      },
      { $sort: { dateLabel: -1 } },
      {
        $facet: {
          meta: [{ $count: "totalDates" }],
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        },
      },
    ];

    const agg = await FoodEntry.aggregate(pipeline);
    const facet = agg[0] || { meta: [], data: [] };
    const totalDates = facet.meta[0]?.totalDates ?? 0;
    const totalPages = Math.ceil(totalDates / limit) || 1;

    const days = (facet.data || []).map((row) => ({
      date: row.dateLabel,
      dayCalories: row.dayCalories,
      dayProtein: row.dayProtein,
      entries: row.items.map((doc) => ({
        _id: doc._id,
        foodName: doc.foodName,
        calories: doc.calories,
        protein: doc.protein,
        quantity: doc.quantity ?? 1,
        unit: doc.unit ?? DEFAULT_FOOD_UNIT,
        date: doc.date,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
    }));

    return res.json({
      days,
      pagination: {
        page,
        limit,
        totalDates,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load history" });
  }
}

/**
 * Weekly totals for chart (last 7 days including today).
 */
export async function getWeekly(req, res) {
  try {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const entries = await FoodEntry.find({
      userId: req.user.id,
      date: { $gte: start, $lte: end },
    });

    const byDay = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      byDay[key] = { calories: 0, protein: 0, label: key };
    }
    for (const e of entries) {
      const key = new Date(e.date).toISOString().slice(0, 10);
      if (byDay[key]) {
        byDay[key].calories += e.calories;
        byDay[key].protein += e.protein;
      }
    }
    const labels = Object.keys(byDay).sort();
    const calories = labels.map((k) => byDay[k].calories);
    const protein = labels.map((k) => byDay[k].protein);

    return res.json({ labels, calories, protein });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load weekly stats" });
  }
}

/**
 * Delete a food entry owned by the user.
 */
export async function deleteFood(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid entry id" });
    }
    const deleted = await FoodEntry.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });
    if (!deleted) {
      return res.status(404).json({ message: "Entry not found" });
    }
    return res.json({ message: "Entry deleted", id: deleted._id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to delete entry" });
  }
}
