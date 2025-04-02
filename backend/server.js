import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";

import roles from "./routes/role.route.js";
import employees from "./routes/useradmin.route.js"


import orderRoutes from "./routes/order.route.js";


import { connectDB } from "./config/db.js";
import { ENV_VARS } from "./config/envVars.js";
const app = express();
dotenv.config();

const PORT = ENV_VARS.PORT;

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/orders", orderRoutes);
app.use("/api/orders", orderRoutes);


app.use("/api/v1/roles", roles);
app.use("/api/v1/employees", employees);


app.listen(PORT, () => {
  console.log("Server is running on port ", PORT);
  connectDB();
});
