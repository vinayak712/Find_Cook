import express from "express";
import { getMyNotifications, markAsRead, markAllAsRead, getUnreadCount } from "../contorllers/notificationcontroller.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getMyNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.put("/read-all", auth, markAllAsRead);
router.put("/:id/read", auth, markAsRead);

export default router;
