import { Router } from "express";
import { deleteUser, dashboard, listUsers, updateUserRole } from "../controllers/adminController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { roleSchema } from "../validators/schemas";

const router = Router();
router.use(requireAuth, requireAdmin);
router.get("/dashboard", dashboard);
router.get("/users", listUsers);
router.patch("/users/:id/role", validateBody(roleSchema), updateUserRole);
router.delete("/users/:id", deleteUser);
export default router;
