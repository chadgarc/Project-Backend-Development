import express from "express";
import User from "../../models/User.js";
import { generateToken } from "../../utils/auth.js";

const router = express.Router();



export default router;