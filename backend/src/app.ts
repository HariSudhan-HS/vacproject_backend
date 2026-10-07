import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/errorHandler";
import adminRoutes from "./routes/adminRoutes";
import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import foodRoutes from "./routes/foodRoutes";
import orderRoutes from "./routes/orderRoutes";

const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => callback(null, !origin || env.FRONTEND_URL.includes(origin)),
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000,
  standardHeaders: "draft-7" as const,
  legacyHeaders: false,
  handler: (_req: express.Request, res: express.Response) => {
    res.status(429).json({
      success: false,
      error: { message: "Too many requests.", code: "RATE_LIMITED" }
    });
  }
};
app.use(rateLimit({ ...rateLimitOptions, limit: 300 }));
app.use("/api/auth", rateLimit({ ...rateLimitOptions, limit: 20 }));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});
app.use("/api/auth", authRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
