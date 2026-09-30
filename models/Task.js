import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ["todo", "in_progress", "done"],
        default: "todo",
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project is required"],
    },
}, {
    timestamps: true
});

const Task = mongoose.model("Task", taskSchema);

export default Task;