import jwt from "jsonwebtoken";
import User from "../../src/models/User.js";

// Generate jwt token for user
export const generateAccessToken = (user, secret) => {
    return jwt.sign(
        { 
            userId: user._id, 
            username: user.username, 
            email: user.email, 
            role: user.role 
        },
        secret,
        { expiresIn: "15m" }
    );
};

// Generate refresh token for user
export const generateRefreshToken = (user, secret, expiresIn = '7d') => {
    return jwt.sign(
        { 
            userId: user._id, 
            username: user.username, 
            email: user.email, 
            role: user.role 
        },
        secret,
        { expiresIn }
    );
};

// Middleware to authenticate user using JWT
export const authenticateUser = async (req, res, next) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ message: "Access denied" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-passwordHash -__v");

        if (!user || user.refreshToken !== token || !user.isActive) {
            return res.status(401).json({ message: "Access denied" });
        }

        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Access denied" });
    }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied" });
    }
};