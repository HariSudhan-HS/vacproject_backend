import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default("mongodb://127.0.0.1:27017/online_food_ordering"),
  JWT_SECRET: z.string().min(32).default("development-only-change-this-secret-before-production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  FRONTEND_URL: z.string()
    .default("http://localhost:3000")
    .transform((value) => value.split(",").map((origin) => origin.trim()))
    .pipe(z.array(z.string().url()).min(1)),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!")
}).superRefine((value, context) => {
  if (value.NODE_ENV === "production" && !process.env.JWT_SECRET) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["JWT_SECRET"],
      message: "JWT_SECRET must be explicitly configured in production"
    });
  }
});

export const env = envSchema.parse(process.env);
