import express from "express";
import userRoutes from "./api/userRoutes.js"
import taskRoutes from "./api/taskRoutes.js"
import projectRoutes from "./api/projectRoutes.js"

const router = express.Router();

router.use("/users", userRoutes)
router.use("/tasks", taskRoutes)
router.use("/projects", projectRoutes)

export default router;