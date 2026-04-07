import { Router } from "express";
import { body } from "express-validator";
import { FOOD_UNITS } from "../config/foodUnits.js";
import { protect } from "../middleware/auth.js";
import * as foodController from "../controllers/foodController.js";

const router = Router();

router.post(
  "/add",
  protect,
  [
    body("foodName").trim().notEmpty().withMessage("Food name is required"),
    body("calories").isFloat({ min: 0 }).withMessage("Calories must be a non-negative number"),
    body("protein").isFloat({ min: 0 }).withMessage("Protein must be a non-negative number"),
    body("quantity").optional().isFloat({ min: 0.01 }).withMessage("Quantity must be at least 0.01"),
    body("unit").optional({ checkFalsy: true }).isIn(FOOD_UNITS).withMessage("Invalid unit"),
    body("date").optional().isISO8601().withMessage("Date must be valid ISO date"),
  ],
  foodController.addFood
);

router.get("/today", protect, foodController.getToday);
router.get("/history", protect, foodController.getHistory);
router.get("/weekly", protect, foodController.getWeekly);
router.delete("/:id", protect, foodController.deleteFood);

export default router;
