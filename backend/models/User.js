const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        plan: {
            type: String,
            enum: ["Free", "Pro", "Premium"],
            default: "Free"
        },

        paymentStatus: {
            type: String,
            enum: ["Not Paid", "Paid"],
            default: "Not Paid"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);