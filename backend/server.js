import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import cookRouter from "./routes/cookRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import notificationRouter from "./routes/notificationRoutes.js";
import aiRouter from "./routes/aiRoutes.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
console.log(
  "DEBUG: JWT_SECRET loaded as:",
  process.env.JWT_SECRET
    ? "Exists (starts with " + process.env.JWT_SECRET.substring(0, 2) + "...)"
    : "UNDEFINED!",
);

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
const PORT = process.env.PORT || 7000;
app.use("/api/auth", authRouter);
app.use("/api/cook", cookRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/ai", aiRouter);
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDb();
});
