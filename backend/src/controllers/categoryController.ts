import type { RequestHandler } from "express";
import { CategoryModel } from "../models/Category";
import { FoodModel } from "../models/Food";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

export const listCategories: RequestHandler = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: await CategoryModel.find().sort({ name: 1 }) });
});

export const createCategory: RequestHandler = asyncHandler(async (req, res) => {
  const category = await CategoryModel.create(req.body);
  res.status(201).json({ success: true, data: category });
});

export const updateCategory: RequestHandler = asyncHandler(async (req, res) => {
  const category = await CategoryModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) throw new AppError("Category not found", 404, "NOT_FOUND");
  res.json({ success: true, data: category });
});

export const deleteCategory: RequestHandler = asyncHandler(async (req, res) => {
  if (await FoodModel.exists({ category: req.params.id })) {
    throw new AppError("Remove or reassign this category's foods first", 409, "CATEGORY_IN_USE");
  }
  const category = await CategoryModel.findByIdAndDelete(req.params.id);
  if (!category) throw new AppError("Category not found", 404, "NOT_FOUND");
  res.status(204).send();
});
