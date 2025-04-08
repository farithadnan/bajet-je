import express from "express";
import { body } from "express-validator";
import { registerUser, login, refreshAccessToken, logout, getCurrentUser } from "../../src/controllers/authController.js";
import { authenticateUser } from "../../src/middleware/auth.js";
import { handleValidation } from "../../src/middleware/handleValidation.js";

const router = express.Router();

const validateRegisterUser = [
    body('username')
        .notEmpty().withMessage('Username is required')
        .isString().withMessage('Username must be a string')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
    body('role')
        .optional()
        .isIn(['admin', 'user']).withMessage('Role must be either admin or user'),
    body('status')
        .optional()
        .isBoolean().withMessage('Status must be a boolean'),
];

const validateLogin = [
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isString().withMessage('Password must be a string')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
];

router.post("/register", handleValidation, validateRegisterUser, registerUser);
router.post("/login", handleValidation, validateLogin, login);
router.post("/refresh-token", authenticateUser, refreshAccessToken);
router.post("/logout", logout);
router.get("/me", authenticateUser, getCurrentUser);

export default router;