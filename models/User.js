import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Username is required."],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [7, "Password must be at least 7 characters."],
    },
}, {
    timestamps: true
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password") || this.isNew) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(this.password, saltRounds);
        this.password = hashedPassword;
    }
    next();
});

userSchema.methods.isCorrectPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;