import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const checkCooks = async () => {
  try {
    await mongoose.connect(process.env.connection_String);
    const db = mongoose.connection;
    const cooks = await db.collection("cookprofiles").find({}).toArray();
    console.log(`Found ${cooks.length} cooks in database.`);
    cooks.forEach(c => {
      console.log(`Cook ID: ${c._id}, Availability: ${c.availability}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkCooks();
