import dotenv from "dotenv";
dotenv.config();

import express from "express";
import routes from "./routes/index.js";
import "./config/connection.js";

const app = express();
const PORT = process.env.PORT || 3001;

// middleware for parsing JSON
app.use(express.json());

// routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
    return res.status(404).json({ success: false, message: "Route not found" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});