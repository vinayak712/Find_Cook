
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
      maxlength: 500,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    profileImage: {
      type: String,
      default: "",
    },
    foodImages: [
      {
        url: String,
        caption: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
  },
  { timestamps: true },
);
const CookProfile = mongoose.model("CookProfile", CookPrfileSchema);

export default CookProfile;