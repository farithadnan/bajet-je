import bcrypt from "bcrypt";
import User from "../../src/models/User.js";

export const getAllUsers = async (req, res) => {
    try {
        // Return all users
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const users = await User.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .select("-passwordHash -__v -refreshToken")
            .lean();

        const totalUsers = await User.countDocuments();

        res.json({
            users: users,
            totalUsers,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: page,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserById = async (req, res) => {
    try {
        // Check if user exists
        const user = await User.findById(req.params.id).select("-passwordHash -__v -refreshToken");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Return user
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { username, email, role, status } = req.body;

        // Check if user exists
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isSelfUpdate = req.user.userId === user.id;

        user.username = username !== undefined ? username : user.username;
        user.email = email !== undefined ? email : user.email;

        // Allow only admin to update role and status
        if (req.user.role === "admin" && !isSelfUpdate) {
            // Prevent self-update from changing role
            if (role) user.role = role;
            if (status !== undefined) user.status = status;

            if (user.status === true) {
                user.deletedDate = null;
                user.deletedBy = null;
            }
        }

        await user.save();

        // If the current user updates their own account, log them out
        if (isSelfUpdate) {
            return res.status(200).json({
                message: "User updated successfully. Please log in again to continue.",
                logout: true
            });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: user.toSafeObject()
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Soft delete user
export const deleteUser = async (req, res) => {
    try {
        // Check if user exists
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.id === req.user.userId) {
            return res.status(400).json({ message: "You cannot delete your own account" });
        }

        if (user.role === "admin") {
            return res.status(400).json({ message: "You cannot delete an admin account" });
        }

        user.deletedDate = new Date();
        user.deletedBy = req.user.username;
        user.status = false;
        user.refreshToken = null;

        await user.save();
        res.status(200).json({
            message: "User deleted successfully"
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid old password" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        if (newPassword === oldPassword) {
            return res.status(400).json({ message: "New password must be different from old password" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        user.passwordHash = passwordHash;
        await user.save();
        res.status(200).json({
            message: "Password changed successfully",
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


