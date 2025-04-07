import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import authRoutes from "../src/routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// app.use(cors({
//     origin: process.env.CLIENT_URL,
//     credentials: true,
// }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });