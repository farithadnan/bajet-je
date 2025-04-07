import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../../src/models/User.js";
import { validationResult } from "express-validator";
import { generateAccessToken, generateRefreshToken } from "../../src/middleware/auth.js";

export const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, role } = req.body;
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });

        if (existingUser) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            role,
            passwordHash,
            createdBy: 'system',
        })

        const accessToken = generateAccessToken(user, process.env.JWT_SECRET);
        const refreshToken = generateRefreshToken(user, process.env.JWT_SECRET);
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });


        res.status(201).json({
            message: "User registered successfully",
            accessToken,
            user: user.toSafeObject()
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser || !existingUser.isActive) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, existingUser.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        existingUser.lastLogin = new Date();
        existingUser.lastLoginIp = req.ip;
        existingUser.lastLoginBrowser = req.headers["user-agent"];

        const accessToken = generateAccessToken(existingUser, process.env.JWT_SECRET);
        const refreshToken = generateRefreshToken(existingUser, process.env.JWT_SECRET);
        existingUser.refreshToken = refreshToken;
        await existingUser.save();

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: "Login successful",
            accessToken,
            user: existingUser.toSafeObject()
        })
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            if (user) {
                user.refreshToken = null;
                await user.save();
            }
        }
        res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
        res.json({ message: "Logged out successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Logout error", error: error.message });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const token = req.cookies.refreshToken;
        if (!token) {
            return res.sendStatus(401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user || user.refreshToken !== token) {
            return res.sendStatus(403);
        }

        const newAccessToken = generateAccessToken(user, process.env.JWT_SECRET);
        res.json({ accessToken: newAccessToken });
    }
    catch (error) {
        res.status(403).json({ message: "Session expired" });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            user: user.toSafeObject()
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
