import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail.js';
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        lowercase: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        unique: true,
        trim: true,
        validate: [isEmail, 'Please enter a valid email address'],
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    lastLogin: Date,
    lastLoginIp: String,
    lastLoginLocation: String,
    lastLoginBrowser: String,
    lastLoginOs: String,
    lastLoginDevice: String,
    createdBy: String,
    updatedBy: String,
    deletedBy: String,
    deletedDate: Date,
},
{
    collection: 'users',
    timestamps: { createdAt: 'createdDate', updatedAt: 'updatedDate' },
});

// Virtual to get info if user is active
userSchema.virtual('isActive').get(function(){
    return this.status === true && !this.deletedDate;
});


userSchema.methods.toSafeObject = function () {
    const { _id, username, email, isActive } = this;
    return { _id, username, email, isActive };
};

// Unique index for username and email
userSchema.index({ username: 1, email: 1 }, { unique: true });

const User = model('User', userSchema);
export default User;