import Booking from "../modles/booking";
import CookProfile from "../modles/cookProfile";
const createBooking = async (req, res) => {
    try {
        const { cookId, bookingDate, message } = req.body;
        const cook = await CookProfile.findById(cookId);
        if (!cook) {
            return res.status(404).json({ message: "Cook not found" });
        }
        const booking = await Booking.create({
            user: req.user.id,
            cook: cookId,
            bookingDate,
            message,
            price: cook.pricePerDay,
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
        }).populate("cook", "pricePerDay")
            .populate("user", "name email");
        res.json(bookings)
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}

const getCookBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            cook:req.user.id
        }).populate("user","name email");
        res.json(bookings);
    } catch (error) {
        res.status(500).json({message:error.message})
    }
}


const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.prams.id);
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