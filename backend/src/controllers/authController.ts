import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";
import { safeUser } from "../utils/safeUser";

function createToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, { subject: userId, expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"] });
}

export const register: RequestHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.create({
    name: req.body.name,
    email: String(req.body.email).toLowerCase(),
    password: req.body.password
  });
  res.status(201).json({ success: true, data: { user: safeUser(user), token: createToken(user.id) } });
});

export const login: RequestHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.findOne({ email: String(req.body.email).toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(String(req.body.password)))) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }
  res.json({ success: true, data: { user: safeUser(user), token: createToken(user.id) } });
});

export const me: RequestHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.authUser?.id);
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  res.json({ success: true, data: { user: safeUser(user) } });
});

export const updateMe: RequestHandler = asyncHandler(async (req, res) => {
  const user = await UserModel.findByIdAndUpdate(
    req.authUser?.id,
    { name: req.body.name },
    { new: true, runValidators: true }
  );
  if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
  res.json({ success: true, data: { user: safeUser(user) } });
});
