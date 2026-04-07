import { Router } from "express";
import { body } from "express-validator";
import { protect } from "../middleware/auth.js";
import * as userController from "../controllers/userController.js";

const router = Router();

router.get("/profile", protect, userController.getProfile);

router.put(
  "/goals",
  protect,
  [
    body("calorieGoal").optional().isFloat({ min: 0 }).withMessage("Calorie goal must be a positive number"),
    body("proteinGoal").optional().isFloat({ min: 0 }).withMessage("Protein goal must be a positive number"),
  ],
  userController.updateGoals
);

export default router;
