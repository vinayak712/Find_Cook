import Booking from "../modles/booking.js";
import CookProfile from "../modles/cookProfile.js";
const createBooking = async (req, res) => {
    try {
        const { cookId, bookingDate, message, proposedPrice } = req.body;
        const cook = await CookProfile.findById(cookId);
        if (!cook) {
            return res.status(404).json({ message: "Cook not found" });
        }
        const booking = await Booking.create({
            user: req.user.id,
            cook: cookId,
            bookingDate,
            message,
            price: proposedPrice ? Number(proposedPrice) : cook.pricePerDay,
        });
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