const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

function createToken(userId){
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// REGISTER
router.post("/register", async function(req, res){
    try{
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });
        }

        if(password.length < 6){
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(409).json({
                success: false,
                message: "User already exists. Please login."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            plan: "Free",
            paymentStatus: "Not Paid"
        });

        const token = createToken(user._id);

        res.status(201).json({
            success: true,
            message: "Account created successfully.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                paymentStatus: user.paymentStatus
            }
        });

    }
    catch(error){
        console.error("Register error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration."
        });
    }
});

// LOGIN
router.post("/login", async function(req, res){
    try{
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ email });

        if(!user){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if(!isPasswordCorrect){
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = createToken(user._id);

        res.json({
            success: true,
            message: "Login successful.",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                plan: user.plan,
                paymentStatus: user.paymentStatus
            }
        });

    }
    catch(error){
        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login."
        });
    }
});

module.exports = router;