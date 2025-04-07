import jwt from "jsonwebtoken";

// Generate jwt token for user
export const generateAccessToken = (user, secret) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        secret,
        { expiresIn: "15m" }
    );
};

// Generate refresh token for user
export const generateRefreshToken = (user, secret) => {
    return jwt.sign(
        { userId: user._id, role: user.role },
        secret,
        { expiresIn: "7d" }
    );
};

// Middleware to authenticate user using JWT
export const authenticateUser = async (req, res, next) => {
    console.log("Cookies:", req.cookies);
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ message: "Authentication required" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to req
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Middleware to check if user is admin
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied: Admin Privileges Required" });
    }
};