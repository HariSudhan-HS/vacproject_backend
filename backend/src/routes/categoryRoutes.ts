import { Router } from "express";
import { createCategory, deleteCategory, listCategories, updateCategory } from "../controllers/categoryController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { categorySchema } from "../validators/schemas";

const router = Router();
router.get("/", listCategories);
router.post("/", requireAuth, requireAdmin, validateBody(categorySchema), createCategory);
router.patch("/:id", requireAuth, requireAdmin, validateBody(categorySchema.partial().refine((value) => Object.keys(value).length > 0, "At least one field is required")), updateCategory);
router.delete("/:id", requireAuth, requireAdmin, deleteCategory);
export default router;
