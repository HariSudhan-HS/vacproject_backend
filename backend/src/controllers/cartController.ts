import type { RequestHandler } from "express";
import { CartModel } from "../models/Cart";
import { FoodModel } from "../models/Food";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const getCart: RequestHandler = asyncHandler(async (req, res) => {
  const cart = await CartModel.findOne({ user: req.authUser?.id }).populate({
    path: "items.food",
    select: "name description price image category isAvailable",
    populate: { path: "category", select: "name slug" }
  });
  res.json({ success: true, data: cart ?? { items: [] } });
});

export const addCartItem: RequestHandler = asyncHandler(async (req, res) => {
  const food = await FoodModel.findOne({ _id: req.body.foodId, isAvailable: true });
  if (!food) throw new AppError("Food is unavailable or does not exist", 404, "FOOD_UNAVAILABLE");
  const cart = await CartModel.findOneAndUpdate(
    { user: req.authUser?.id, "items.food": food._id },
    { $inc: { "items.$.quantity": req.body.quantity } },
    { new: true }
  );
  const updated = cart ?? await CartModel.findOneAndUpdate(
    { user: req.authUser?.id },
    { $push: { items: { food: food._id, quantity: req.body.quantity } }, $setOnInsert: { user: req.authUser?.id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  if (!updated) throw new AppError("Unable to update cart", 500, "CART_UPDATE_FAILED");
  const quantity = updated.items.find((item) => item.food.toString() === food.id)?.quantity;
  if (quantity !== undefined && quantity > 99) {
    await CartModel.updateOne({ _id: updated._id, "items.food": food._id }, { $set: { "items.$.quantity": 99 } });
  }
  res.status(200).json({ success: true, data: await CartModel.findById(updated._id).populate("items.food", "name price image isAvailable") });
});

export const updateCartItem: RequestHandler = asyncHandler(async (req, res) => {
  const cart = await CartModel.findOneAndUpdate(
    { user: req.authUser?.id, "items.food": req.params.foodId },
    { $set: { "items.$.quantity": req.body.quantity } },
    { new: true }
  ).populate("items.food", "name price image isAvailable");
  if (!cart) throw new AppError("Cart item not found", 404, "NOT_FOUND");
  res.json({ success: true, data: cart });
});

export const removeCartItem: RequestHandler = asyncHandler(async (req, res) => {
  const cart = await CartModel.findOneAndUpdate(
    { user: req.authUser?.id },
    { $pull: { items: { food: req.params.foodId } } },
    { new: true }
  );
  if (!cart) throw new AppError("Cart not found", 404, "NOT_FOUND");
  res.json({ success: true, data: cart });
});

export const clearCart: RequestHandler = asyncHandler(async (req, res) => {
  await CartModel.findOneAndUpdate({ user: req.authUser?.id }, { $set: { items: [] } });
  res.status(204).send();
});
