
import mongoose from "mongoose";


const CookPrfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cuisines: {
      type: [String],
      required: true,
    },
    experience: {
      required: true,
      type: Number,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      state: String,
      country: String,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    bio: {
      type: String,
      kMaxLength: 500,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);
const CookProfile = mongoose.model("CookProfile", CookPrfileSchema);

const bookingSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CookProfile",
      required: true,
    },
    bookingDates: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
    },

    message: {
      type: String,
    },
  },
  { timestamps: true },
);
("Booking", bookingSchema);
export default CookProfile;