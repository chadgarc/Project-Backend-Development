import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

mongoose.connection.once("open", () => {
    console.log("Connected to MongoDB:", mongoose.connection.name);
});

mongoose.connection.on("error", (error) => {
    console.error("Error:", error.message);
});

mongoose.connection.once("close", () => {
    console.log("Connection to MongoDB closed.")
})

export default mongoose;