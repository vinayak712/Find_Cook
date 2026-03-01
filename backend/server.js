import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";

app.use(cookieParser());
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectDb();
});
