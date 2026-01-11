// backend/controllers/users.controller.js
import { listAllUsers, getAssignedProjects, assignProjects } from "../models/users.model.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

export async function getUsers(req, res) {
    try {
        const users = await listAllUsers();
        // For each user, fetch their assigned projects
        const usersWithProjects = await Promise.all(
            users.map(async (u) => {
                const projects = await getAssignedProjects(u.id);
                return { ...u, projects };
            })
        );
        return sendSuccess(res, usersWithProjects);
    } catch (err) {
        console.error("List users error", err);
        return sendError(res, 500, "Failed to list users");
    }
}

export async function updateUserProjects(req, res) {
    try {
        const { id } = req.params;
        const { projectIds } = req.body; // Array of UUIDs
        await assignProjects(id, projectIds);
        return sendSuccess(res, { message: "Projects assigned successfully" });
    } catch (err) {
        console.error("Assign projects error", err);
        return sendError(res, 500, "Failed to assign projects");
    }
}
