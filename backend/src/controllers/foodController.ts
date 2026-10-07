import type { RequestHandler } from "express";
import { CategoryModel } from "../models/Category";
import { FoodModel } from "../models/Food";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { foodQuerySchema } from "../validators/schemas";

export const listFoods: RequestHandler = asyncHandler(async (req, res) => {
  const query = foodQuerySchema.safeParse(req.query);
  if (!query.success) throw new AppError("Invalid search or pagination parameters", 400, "VALIDATION_ERROR");
  const { search, category, page, limit } = query.data;
  const filter: Record<string, unknown> = { isAvailable: true };
  if (category) {
    const categoryId = /^[a-f\d]{24}$/i.test(category)
      ? category
      : (await CategoryModel.findOne({ slug: category.toLowerCase() }).select("_id"))?._id;
    if (!categoryId) throw new AppError("Category not found", 404, "NOT_FOUND");
    filter.category = categoryId;
  }
  if (search) filter.$text = { $search: search };
  const [foods, total] = await Promise.all([
    FoodModel.find(filter).populate("category", "name slug").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    FoodModel.countDocuments(filter)
  ]);
  res.json({ success: true, data: foods, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

export const getFood: RequestHandler = asyncHandler(async (req, res) => {
  const food = await FoodModel.findById(req.params.id).populate("category", "name slug");
  if (!food || !food.isAvailable) throw new AppError("Food not found", 404, "NOT_FOUND");
  res.json({ success: true, data: food });
});

export const createFood: RequestHandler = asyncHandler(async (req, res) => {
  if (!(await CategoryModel.exists({ _id: req.body.category }))) {
    throw new AppError("Category not found", 400, "INVALID_CATEGORY");
  }
  const food = await FoodModel.create(req.body);
  res.status(201).json({ success: true, data: await food.populate("category", "name slug") });
});

export const updateFood: RequestHandler = asyncHandler(async (req, res) => {
  if (req.body.category && !(await CategoryModel.exists({ _id: req.body.category }))) {
    throw new AppError("Category not found", 400, "INVALID_CATEGORY");
  }
  const food = await FoodModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate("category", "name slug");
  if (!food) throw new AppError("Food not found", 404, "NOT_FOUND");
  res.json({ success: true, data: food });
});

export const deleteFood: RequestHandler = asyncHandler(async (req, res) => {
  const food = await FoodModel.findByIdAndDelete(req.params.id);
  if (!food) throw new AppError("Food not found", 404, "NOT_FOUND");
  res.status(204).send();
});
