import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const checkDbs = async () => {
  try {
    const conn1 = await mongoose.createConnection(process.env.connection_String, { dbName: "test" }).asPromise();
    const testCooks = await conn1.collection("cookprofiles").countDocuments();
    const testUsers = await conn1.collection("users").countDocuments();
    
    const conn2 = await mongoose.createConnection(process.env.connection_String, { dbName: "Cookies" }).asPromise();
    const cookiesCooks = await conn2.collection("cookprofiles").countDocuments();
    const cookiesUsers = await conn2.collection("users").countDocuments();

    console.log("Database 'test' -> Users:", testUsers, "CookProfiles:", testCooks);
    console.log("Database 'Cookies' -> Users:", cookiesUsers, "CookProfiles:", cookiesCooks);
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

checkDbs();
