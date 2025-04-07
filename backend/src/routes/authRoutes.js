import express from "express";
import { registerUser, login, refreshAccessToken, logout, getCurrentUser } from "../../src/controllers/authController.js";
import { authenticateUser } from "../../src/middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);
router.get("/me", authenticateUser, getCurrentUser);

export default router;