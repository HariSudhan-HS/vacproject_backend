import type { RequestHandler } from "express";
import { Types } from "mongoose";
import { CartModel } from "../models/Cart";
import { FoodModel } from "../models/Food";
import { OrderModel } from "../models/Order";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { orderQuerySchema } from "../validators/schemas";

export const checkout: RequestHandler = asyncHandler(async (req, res) => {
  const userId = req.authUser?.id;
  const cart = await CartModel.findOne({ user: userId }).populate("items.food", "name price image isAvailable");
  if (!cart || cart.items.length === 0) throw new AppError("Your cart is empty", 400, "EMPTY_CART");

  const items = cart.items.flatMap((item) => {
    const food = item.food as unknown as { _id: Types.ObjectId; name: string; price: number; image: string; isAvailable: boolean } | null;
    if (!food || !food.isAvailable) return [];
    return [{ food: food._id, name: food.name, image: food.image, unitPrice: food.price, quantity: item.quantity }];
  });
  if (items.length !== cart.items.length) throw new AppError("One or more cart items are unavailable", 409, "FOOD_UNAVAILABLE");
  const total = Math.round(items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0) * 100) / 100;

  const order = await OrderModel.create({
    user: userId,
    items,
    total,
    deliveryAddress: req.body.deliveryAddress,
    status: "pending"
  });
  await CartModel.updateOne({ _id: cart._id }, { $set: { items: [] } });
  res.status(201).json({ success: true, data: order });
});

export const listMyOrders: RequestHandler = asyncHandler(async (req, res) => {
  const query = orderQuerySchema.safeParse(req.query);
  if (!query.success) throw new AppError("Invalid pagination parameters", 400, "VALIDATION_ERROR");
  const { page, limit, status } = query.data;
  const filter: Record<string, unknown> = { user: req.authUser?.id };
  if (status) filter.status = status;
  const [orders, total] = await Promise.all([
    OrderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    OrderModel.countDocuments(filter)
  ]);
  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getMyOrder: RequestHandler = asyncHandler(async (req, res) => {
  const order = await OrderModel.findOne({ _id: req.params.id, user: req.authUser?.id });
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  res.json({ success: true, data: order });
});

export const listAllOrders: RequestHandler = asyncHandler(async (req, res) => {
  const query = orderQuerySchema.safeParse(req.query);
  if (!query.success) throw new AppError("Invalid pagination parameters", 400, "VALIDATION_ERROR");
  const { page, limit, status } = query.data;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  const [orders, total] = await Promise.all([
    OrderModel.find(filter).populate("user", "name email").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    OrderModel.countDocuments(filter)
  ]);
  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const updateOrderStatus: RequestHandler = asyncHandler(async (req, res) => {
  const order = await OrderModel.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true });
  if (!order) throw new AppError("Order not found", 404, "NOT_FOUND");
  res.json({ success: true, data: order });
});
