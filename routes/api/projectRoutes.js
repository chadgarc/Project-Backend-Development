import express from 'express';
import Project from '../../models/Project.js';
import Task from '../../models/Task.js';
import { protect } from '../../utils/auth.js';

const router = express.Router();

// This protects all routes defined below with the protect function
// All functions below will require a valid JWT token to access
router.use(protect);

// Post - Create a project
router.post("/", async (req, res) => {
    try {
    const { name, description } = req.body;

    // Validation
    if(!name)
        return res.status(400).json({ success: false, message: "Please provide at least name field." });

    // Create project
    const project = await Project.create({
        name,
        description: description || "",
        user: req.user.id,
    });

    res.status(201).json({ success: true, project });
    }catch(error){
        console.error(error);
        return res.status(400).json({ success: false, message: error.message });
    }
})

// Get all projects for the user
router.get("/", async (req, res) => {
    try{

        const projects = await Project.find({ user: req.user.id });
        
        res.status(200).json({ success: true, projects });
    } catch(error) {
        console.error(error);
        return res.status(400).json({ success: false, message: error.message });
    }
})

// update project
router.put("/:id", async (req, res) => {
    try{
        // Get project
        const project = await Project.findById(req.params.id);
        
        // Verify project exists
        if(!project)
            return res.status(404).json({ success: false, message: "Project not found." });
        
        // Verify user owns project
        if(project.user.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized"});
        
        // Validation
        const { name, description } = req.body;

        // Update project
        project.name = name ?? project.name;
        project.description = description ?? project.description;

        await project.save();

        res.status(200).json({ success: true, project });
    }catch(error){
        console.error(error);
        if(error.name === "CastError")
            return res.status(400).json({ success: false, message: "Invalid project ID." });
        return res.status(400).json({ success: false, message: error.message });
    }
})

// Get one
router.get("/:id", async (req, res) => {
    try{
        // Get project
        const project = await Project.findById(req.params.id);

        // Verify project exists
        if(!project)
            return res.status(404).json({ success: false, message: "Project not found." });
        
        // Verify user owns project
        if(project.user.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized" });
        
        // Return project
        res.status(200).json({ success: true, project });
    }catch(error){
        console.error(error);
        if(error.name === "CastError")
            return res.status(400).json({ success: false, message: "Invalid project ID." });
        return res.status(400).json({ success: false, message: error.message });
    }
})

// delete project
router.delete("/:id", async (req, res) => {
    try {
        // Get project
        const project = await Project.findById(req.params.id);
        
        // Verify project exists
        if(!project)
            return res.status(404).json({ success: false, message: "Project not found." });
        
        // Verify user owns project
        if(project.user.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized" });
        
        // Delete all tasks associated with the project
        await Task.deleteMany({ project: project._id });
        
        // Delete project
        await project.deleteOne();
        
        res.status(200).json({ success: true, message: "Project deleted successfully" });
    } catch (error) {
        console.error(error);
        if(error.name === "CastError")
            return res.status(400).json({ success: false, message: "Invalid project ID." });
        return res.status(400).json({ success: false, message: error.message });
    }
})

// Post and Get tasks are nested inside projects, so tasks will be like /api/projects/:projectId/tasks

// Create Task
router.post('/:projectId/tasks', async (req, res) => {
    try{
        // Get project, to verify parent exist
        const project = await Project.findById(req.params.projectId);

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        // Verify user owns project
        if(project.user.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized" });
        
        const { title, description, status } = req.body;

        // Validate
        if(!title){
            return res.status(400).json({ success: false, message: "Please provide title field." });
        }
        
        // Create task
        const task = await Task.create({
            title,
            description: description || "",
            project: project._id,
            status: status || "todo",
        })

        res.status(201).json({ success: true, task });
    }catch(error){
        console.error(error);
        if(error.name === "CastError")
            return res.status(400).json({ success: false, message: "Invalid project ID." });
        return res.status(400).json({ success: false, message: error.message });
    }
})

// Get tasks of one project
router.get("/:projectId/tasks", async (req, res) => {
    try{
        // Get project, to verify parent exist
        const project = await Project.findById(req.params.projectId);

        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        // Verify user owns project
        if(project.user.toString() !== req.user.id)
            return res.status(403).json({ success: false, message: "Not authorized" });
        
        const tasks = await Task.find({ project: req.params.projectId });
        
        res.status(200).json({ success: true, tasks });
    }catch(error){
        console.error(error);
        if(error.name === "CastError")
            return res.status(400).json({ success: false, message: "Invalid project ID." });
        return res.status(400).json({ success: false, message: error.message });
    }
})

export default router;