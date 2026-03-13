import express from'express'
import { login, Signup,logout } from "../contorllers/authcontroller";

const router = express.Router();
router.post("/signup", Signup);
router.post("/login", login);
router.post("/logout", logout);
export default router;