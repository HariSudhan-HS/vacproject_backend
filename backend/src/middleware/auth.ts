import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";
import { env } from "../config/env";
import { UserModel } from "../models/User";
import { AppError } from "../utils/AppError";
import { asyncHandler } from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; role: "customer" | "admin" };
    }
  }
}

export const requireAuth: RequestHandler = asyncHandler(async (req, _res, next) => {
  const authorization = req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401, "UNAUTHORIZED");
  }
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(authorization.slice(7), env.JWT_SECRET);
  } catch {
    throw new AppError("Invalid or expired token", 401, "INVALID_TOKEN");
  }
  if (typeof payload === "string" || typeof payload.sub !== "string") {
    throw new AppError("Invalid token", 401, "INVALID_TOKEN");
  }
  const user = await UserModel.findById(payload.sub).select("_id role");
  if (!user) {
    throw new AppError("User no longer exists", 401, "INVALID_TOKEN");
  }
  req.authUser = { id: user.id, role: user.role };
  next();
});

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (req.authUser?.role !== "admin") {
    next(new AppError("Administrator access required", 403, "FORBIDDEN"));
    return;
  }
  next();
};
