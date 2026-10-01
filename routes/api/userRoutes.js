import express from "express";
import User from "../../models/User.js";
import { generateToken } from "../../utils/auth.js";

const router = express.Router();

// Post - register user
router.post("/register", async(req, res) => {
    try{
        const { username, email, password } = req.body;

        // Validation
        if(!username || !email || !password){
            return res.status(400).json({ success: false, message: "Please provide all fields" });
        }

        //Check if user exists
        const userExists = await User.findOne({ email });
        if(userExists){
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // Create user
        const user = await User.create({ username, email, password });

        // Generate token
        const token = generateToken(user._id);

        // Respond with generated token
        return res.status(201).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } });
    }catch(error){
        console.error(error);
        // Validation error
        if(error.name === "ValidationError"){
            return res.status(400).json({ success: false, message: error.message });
        }
        // code 11000 means duplicate key error, usually email
        if(error.code === 11000)
            return res.status(400).json({ success: false, message: "Email already exists" });
        
        // Other server errors
        return res.status(500).json({ success: false, message: "Server error" });
    }
})

// Post - login user
router.post("/login", async(req, res) => {
    try{
        const { email, password } = req.body;

        // Validation
        if(!email || !password){
            return res.status(400).json({ success: false, message: "Please provide all fields" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if(!user || !(await user.isCorrectPassword(password))){
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user._id);

        // Respond with generated token
        return res.status(200).json({ success: true, token, user: { id: user._id, username: user.username, email: user.email } });
    }catch(error){
        console.error(error);
        return res.status(400).json({ success: false, message: error.message });
        
    }
})

export default router;