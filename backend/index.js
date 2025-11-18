import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./DB/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import cloudinaryRoutes from "./routes/cloudinary.route.js";
import houseRoutes from "./routes/house.route.js";

dotenv.config();
const app = express();

// Update CORS to allow all origins (for development)
app.use(
  cors({
    origin: "*", // Allow all origins
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const port = process.env.PORT || 5000;

//----------------------------Root Routes-----------------------------

app.use("/api/auth", authRoutes);
app.use("/api/houses", houseRoutes);
app.use("/api/cloudinary", cloudinaryRoutes);

//----------------------------Start Server-----------------------------

// Listen on all network interfaces (0.0.0.0)
app.listen(port, "0.0.0.0", () => {
  connectDB();
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📱 Mobile access: http://192.168.43.131:${port}`);
  console.log(`💻 Local access: http://localhost:${port}`);
});
