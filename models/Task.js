import mongoose, { Schema } from "mongoose";

// STATUS_ALIASES allows for multiple values to be accepted as the same status
// This allows for flexibility when users input status values
const STATUS_ALIASES = {
    todo: ["todo", "to_do", "to do"],
    in_progress: ["in_progress", "in progress"],
    completed: ["completed", "done"]
};

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
        enum: ["todo", "in_progress", "completed"],
        default: "todo",
        set: (value) => {
            if (typeof value !== "string") return value;
            const lower = value.toLowerCase().trim();
            for (const [key, aliases] of Object.entries(STATUS_ALIASES)) {
                if (aliases.includes(lower)) return key;
            }
            return lower;
        },
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        required: [true, "Project is required"],
    },
}, {
    timestamps: true
});

const Task = mongoose.model("Task", taskSchema);

export default Task;