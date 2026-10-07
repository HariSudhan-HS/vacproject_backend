import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");
const imageUrl = z.string().url().or(z.literal("")).optional();

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128)
});
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(128)
});
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(100)
});
export const foodSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1).max(2000),
  price: z.number().finite().min(0),
  image: imageUrl,
  category: objectId,
  isAvailable: z.boolean().optional()
});
export const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1000).optional(),
  image: imageUrl
});
export const cartItemSchema = z.object({ foodId: objectId, quantity: z.number().int().min(1).max(99).default(1) });
export const quantitySchema = z.object({ quantity: z.number().int().min(1).max(99) });
export const checkoutSchema = z.object({ deliveryAddress: z.string().trim().min(5).max(500) });
export const orderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"])
});
export const roleSchema = z.object({ role: z.enum(["customer", "admin"]) });
export const foodQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
export const orderQuerySchema = z.object({
  status: orderStatusSchema.shape.status.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});
