import express from 'express'
import {
    createBooking,
    getCookBookings,
    getUserBooking,
    updateBookingStatus
} from '../contorllers/bookingcontroller'
import auth from '../middleware/authMiddleware'
import authorizeRoles from '../middleware/roleMiddleware'
const router = express.Router();
router.get("/cook", auth, authorizeRoles("cook"), getCookBookings)
router.get("/user", auth, authorizeRoles("user", getUserBooking));
router.post("/", auth, authorizeRoles("user"), createBooking);
router.put("/:id/status", auth, authorizeRoles("cook"), updateBookingStatus);
export default router;