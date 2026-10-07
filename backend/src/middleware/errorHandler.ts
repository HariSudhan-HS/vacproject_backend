import type { ErrorRequestHandler, RequestHandler } from "express";
import mongoose from "mongoose";
import { AppError } from "../utils/AppError";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let code: string | undefined;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = error.message;
    code = "VALIDATION_ERROR";
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid identifier";
    code = "INVALID_ID";
  } else if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    statusCode = 409;
    message = "A record with that value already exists";
    code = "DUPLICATE_VALUE";
  }

  res.status(statusCode).json({
    success: false,
    error: { message, ...(code ? { code } : {}) }
  });
};
