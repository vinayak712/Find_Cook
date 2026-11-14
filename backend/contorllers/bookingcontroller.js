import Booking from "../modles/booking.js";
import CookProfile from "../modles/cookProfile.js";
import { User } from "../modles/user.js";
import { createNotification } from "./notificationcontroller.js";

const createBooking = async (req, res) => {
    try {
        const { cookId, bookingDate, message, proposedPrice } = req.body;
        const cook = await CookProfile.findById(cookId);
        if (!cook) {
            return res.status(404).json({ message: "Cook not found" });
        }
        // Prevent duplicate bookings for same user+cook+date
        const existingBooking = await Booking.findOne({
            user: req.user.id,
            cook: cookId,
            bookingDate: new Date(bookingDate),
            status: { $in: ["pending", "accepted"] }
        });
        if (existingBooking) {
            return res.status(400).json({ message: "You already have a booking with this cook on that date." });
        }
        const booking = await Booking.create({
            user: req.user.id,
            cook: cookId,
            bookingDate,
            message,
            price: proposedPrice ? Number(proposedPrice) : cook.pricePerDay,
        });

        // Notify cook
        const client = await User.findById(req.user.id);
        const clientName = client ? client.name : "A client";
        await createNotification(
            cook.user,
            "New Booking Request! 📅",
            `${clientName} has requested a booking for ${new Date(bookingDate).toLocaleDateString()} at $${booking.price}/day.`,
            "booking_request",
            "/cook/bookings"
        );

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}


const getUserBooking = async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user.id
        }).populate({
            path: "cook",
            select: "pricePerDay user",
            populate: { path: "user", select: "name email" }
        })
            .populate("user", "name email");
        res.json(bookings)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const getCookBookings = async (req, res) => {
    try {
        // First find the cook's profile to get the CookProfile _id
        const cookProfile = await CookProfile.findOne({ user: req.user.id });
        if (!cookProfile) {
            return res.status(404).json({ message: "Cook profile not found" });
        }
        const bookings = await Booking.find({
            cook: cookProfile._id
        }).populate("user","name email");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}


const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
               return res.status(404).json({
        message: "Booking not found"
      });   
        }
        booking.status = status;
        await booking.save();

        // Send notifications based on the new status
        if (status === "accepted") {
            await createNotification(
                booking.user,
                "Booking Accepted! 🎉",
                `Your booking request for ${new Date(booking.bookingDate).toLocaleDateString()} has been accepted by the chef.`,
                "booking_accepted",
                "/dashboard"
            );
        } else if (status === "rejected") {
            await createNotification(
                booking.user,
                "Booking Declined ❌",
                `Your booking request for ${new Date(booking.bookingDate).toLocaleDateString()} was declined.`,
                "booking_rejected",
                "/dashboard"
            );
        } else if (status === "completed") {
            // Client completed the booking, notify chef!
            const cook = await CookProfile.findById(booking.cook);
            if (cook) {
                await createNotification(
                    cook.user,
                    "Booking Marked Complete! 🍽️",
                    `The client marked the booking for ${new Date(booking.bookingDate).toLocaleDateString()} as completed.`,
                    "booking_completed",
                    "/cook/bookings"
                );
            }
        }

        res.json({message:"Booking Updated", booking})
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

export {
    getCookBookings,
    updateBookingStatus,
    getUserBooking,
    createBooking,
}