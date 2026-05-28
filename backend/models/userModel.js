import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: "" },
    role: { type: String, default: 'GENERAL' },

    // 🔥 Book Access Section
    purchasedBooks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book"
        }
    ],

    accessibleBooks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Book"
        }
    ],

    subscription: {
        type: String,
        enum: ["NONE", "BASIC", "PREMIUM"],
        default: "NONE"
    },

    subscriptionExpiresAt: {
        type: Date,
        default: null
    },
    authProvider: { 
        type: String, 
        enum: ['local', 'google', 'facebook'], 
        default: 'local' 
    },

    readingProgress: [
        {
            book: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Book"
            },
            lastPage: {
                type: Number,
                default: 0
            },
            completed: {
                type: Boolean,
                default: false
            }
        }
    ],

    createdAt: { type: Date, default: Date.now }

}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User;
