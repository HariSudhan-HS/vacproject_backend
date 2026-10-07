import { Router } from "express";
import { createFood, deleteFood, getFood, listFoods, updateFood } from "../controllers/foodController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { foodSchema } from "../validators/schemas";

const router = Router();
router.get("/", listFoods);
router.get("/:id", getFood);
router.post("/", requireAuth, requireAdmin, validateBody(foodSchema), createFood);
router.patch("/:id", requireAuth, requireAdmin, validateBody(foodSchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required")), updateFood);
router.delete("/:id", requireAuth, requireAdmin, deleteFood);
export default router;
