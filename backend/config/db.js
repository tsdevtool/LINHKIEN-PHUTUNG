import mongoose from "mongoose";
import { ENV_VARS } from "./envVars.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(ENV_VARS.MONGO_URI);
    console.log("MongoDB connected: " + mongoose.connection.host);
  } catch (error) {
    console.log("Error connecting to MongoDB: ", error.message);
    process.exit(1);
  }
};
