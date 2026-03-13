import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true
        },
        cook: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CookProfile",
            required:true,
        },
        bookingDate: {
            type: Date,
            required:true,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed"],
            default:"pending",
        },
        message: String,
        price:Number
    },
    {timestamps:true}
)
export default mongoose.model("Bookig", bookingSchema);