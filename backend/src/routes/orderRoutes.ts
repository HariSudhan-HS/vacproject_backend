import { Router } from "express";
import { checkout, getMyOrder, listAllOrders, listMyOrders, updateOrderStatus } from "../controllers/orderController";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { checkoutSchema, orderStatusSchema } from "../validators/schemas";

const router = Router();
router.use(requireAuth);
router.post("/checkout", validateBody(checkoutSchema), checkout);
router.get("/mine", listMyOrders);
router.get("/mine/:id", getMyOrder);
router.get("/", requireAdmin, listAllOrders);
router.patch("/:id/status", requireAdmin, validateBody(orderStatusSchema), updateOrderStatus);
export default router;
