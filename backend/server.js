import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import orderRoutes from "./routes/orderRoutes.js";

import { connectDB } from "./config/db.js";
import { ENV_VARS } from "./config/envVars.js";
const app = express();
dotenv.config();

const PORT = ENV_VARS.PORT;

// CORS configuration
app.use(cors());

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/orders", orderRoutes);




app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
  connectDB();
});
