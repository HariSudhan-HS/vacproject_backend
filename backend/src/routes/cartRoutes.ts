import { Router } from "express";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "../controllers/cartController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { cartItemSchema, quantitySchema } from "../validators/schemas";

const router = Router();
router.use(requireAuth);
router.get("/", getCart);
router.post("/items", validateBody(cartItemSchema), addCartItem);
router.patch("/items/:foodId", validateBody(quantitySchema), updateCartItem);
router.delete("/items/:foodId", removeCartItem);
router.delete("/", clearCart);
export default router;
