import type { RequestHandler } from "express";
import { UserModel } from "../models/User";
import { FoodModel } from "../models/Food";
import { OrderModel } from "../models/Order";
import { CartModel } from "../models/Cart";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { safeUser } from "../utils/safeUser";

export const dashboard: RequestHandler = asyncHandler(async (_req, res) => {
  const [users, foods, orders, revenueResult] = await Promise.all([
    UserModel.countDocuments(),
    FoodModel.countDocuments(),
    OrderModel.countDocuments(),
    OrderModel.aggregate<{ total: number }>([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } }
    ])
  ]);
  res.json({
    success: true,
    data: { users, foods, orders, revenue: revenueResult[0]?.total ?? 0 }
  });
});

export const listUsers: RequestHandler = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
  const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = safeSearch
    ? { $or: [{ name: { $regex: safeSearch, $options: "i" } }, { email: { $regex: safeSearch, $options: "i" } }] }
    : {};
  const [users, total] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    UserModel.countDocuments(filter)
  ]);
  res.json({
    success: true,
    data: users.map(safeUser),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
});

export const updateUserRole: RequestHandler = asyncHandler(async (req, res) => {
  if (req.params.id === req.authUser?.id && req.body.role !== "admin") {
    throw new AppError("You cannot remove your own administrator role", 400, "SELF_ROLE_CHANGE");
  }
  const user = await UserModel.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true });
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  res.json({ success: true, data: safeUser(user) });
});

export const deleteUser: RequestHandler = asyncHandler(async (req, res) => {
  if (req.params.id === req.authUser?.id) throw new AppError("You cannot delete your own account", 400, "SELF_DELETE");
  const user = await UserModel.findByIdAndDelete(req.params.id);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  await CartModel.deleteOne({ user: user._id });
  res.status(204).send();
});
