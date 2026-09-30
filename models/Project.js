import mongoose, { Schema } from "mongoose";

const projectSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"],
    },
    name: {
        type: String,
        required: [true, "Project name is required"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true
});

const Project = mongoose.model("Project", projectSchema);

export default Project;