import { Router } from "express";
import { login, me, register, updateMe } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { loginSchema, profileSchema, registerSchema } from "../validators/schemas";

const router = Router();
router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, validateBody(profileSchema), updateMe);
export default router;
