import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoutes.js";
import cookRouter from "./routes/cookRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

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
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  }),
);
const PORT = process.env.PORT || 7000;
app.use("/api/auth", authRouter);
app.use("/api/cook", cookRouter);
app.use("/api/bookings", bookingRouter);
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDb();
});
