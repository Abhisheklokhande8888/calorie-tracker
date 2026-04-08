import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import * as savedFoodController from "../controllers/savedFoodController.js";
import { FOOD_UNITS } from "../config/foodUnits.js";

const router = Router();

const itemValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("calories").isFloat({ min: 0 }).withMessage("Calories must be a non-negative number"),
  body("protein").isFloat({ min: 0 }).withMessage("Protein must be a non-negative number"),
  body("unit").isIn(FOOD_UNITS).withMessage("Invalid unit"),
];

router.get("/", protect, savedFoodController.list);
router.post("/", protect, itemValidators, savedFoodController.create);
router.put("/:id", protect, itemValidators, savedFoodController.update);
router.delete("/:id", protect, savedFoodController.remove);

export default router;
