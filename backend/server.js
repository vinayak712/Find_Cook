import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from 'cors'
import authRouter from "./routes/authRoutes.js";
import cookRouter from "./routes/cookRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";



dotenv.config();

const app = express();
app.use(cookieParser());
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials:true
  })
)
const PORT = process.env.PORT || 7000;
app.use("/api/auth", authRouter)
app.use("/api/cook", cookRouter);
app.use("/api/bookings", bookingRouter);
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDb();
});
