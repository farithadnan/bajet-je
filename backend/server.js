import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import authRoutes from "../backend/src/routes/authRoutes.js";
import userRoutes from "../backend/src/routes/userRoutes.js";
import budgetTemplateRoutes from "../backend/src/routes/budgetTemplateRoutes.js";
import monthlyBudgetRoutes from "../backend/src/routes/monthlyBudgetRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:58101"], // Add all your frontend origins
    credentials: true, // This is important for cookies/auth
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/budget-templates", budgetTemplateRoutes);
app.use("/api/monthly-budgets", monthlyBudgetRoutes);

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });
