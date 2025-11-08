import express from "express";
import authMiddleware from "../middleware/auth.js"
import { createTask, deleteTask, getTaskById, getTasks, updateTask } from "../controllers/taskController.js";

const taskRouter = express.Router();

taskRouter.route('/tm')
.get(authMiddleware, getTasks)
.post(authMiddleware, createTask);

taskRouter.route('/:id/tm')
.get(authMiddleware, getTaskById)
.put(authMiddleware, updateTask)
.delete(authMiddleware, deleteTask);

export default taskRouter;