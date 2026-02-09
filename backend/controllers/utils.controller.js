import { previewEntityId } from "../utils/idGenerator.js";
import { sendSuccess, sendError } from "../utils/response.utils.js";

export async function previewIdHandler(req, res) {
    try {
        const { module, projectName, account } = req.query;
        if (!module) return sendError(res, 400, "Module required");

        const previewId = await previewEntityId(
            req.user.email,
            projectName || (account || "GEN"),
            module
        );

        return sendSuccess(res, { previewId });
    } catch (err) {
        console.error("Preview ID Error", err);
        return sendError(res, 500, "Failed to preview ID");
    }
}
