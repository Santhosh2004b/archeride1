
import { Router } from "express";
import { getUsers, updateUserProjects } from "../controllers/users.controller.js";

const router = Router();

router.get("/", getUsers);
router.post("/:id/projects", updateUserProjects);

export default router;
