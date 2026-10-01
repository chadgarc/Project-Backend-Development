import express from 'express';
import Task from '../../models/Task.js';
import { protect } from '../../utils/auth.js';

const router = express.Router();

router.use(protect);

// update task
router.put("/:taskId", async (req,res) => {
    try{
        // Verfy task exist
        const task = await Task.findById(req.params.taskId);

        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        // Verify user owns task
        if(task.project.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized" });
        
        const { title, description, status } = req.body;

        // Validate
        if(!title){
            return res.status(400).json({ success: false, message: "Please provide title field." });
        }
        
        // Update task
        task.title = title ?? task.title;
        task.description = description ?? task.description;
        task.status = status ?? task.status;

        await task.save();

        res.status(200).json({ success: true, task });
    } catch(error){
        console.error(error);
        return res.status(400).json({ success: false, message: error.message });
    }
})