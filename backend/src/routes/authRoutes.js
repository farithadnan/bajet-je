import express from "express";
import { registerUser, login, refreshAccessToken, logout, getCurrentUser } from "../../src/controllers/authController.js";
import { authenticateUser } from "../../src/middleware/auth.js";
import { handleValidation } from "../../src/middleware/handleValidation.js";

const router = express.Router();

router.post("/register", handleValidation, registerUser);
router.post("/login", handleValidation, login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", authenticateUser, getCurrentUser);

export default router;