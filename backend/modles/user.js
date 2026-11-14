import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required:true,
    },
    favorites: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "CookProfile"
    }]
  },
  { timestamps: true },
);
const User = mongoose.model("User", UserSchema);


export {  User };
