import mongoose from "mongoose";
const connectDb = async () => {
  try {
    await mongoose.connect(process.env.connection_String);
    console.log(`MongoDB connected Succesfully `);
  } catch (error) {
    console.log(`error while connecting to mongoDb:`, error.message);
  }
};

export default connectDb;
