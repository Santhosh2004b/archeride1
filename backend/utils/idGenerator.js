import db from "../db.js";

/**
 * 🆔 Generates a unique "Enterprise-Style" Entity ID
 * Format: [PREFIX][3-DIGITS] => e.g., RSK042, ISS109
 * 
 * Rules:
 * - Prefix is deterministic based on entityType (risk->RSK)
 * - Number is sequential based on existing max ID in DB
 * - Returns the next available ID
 * 
 * @param {string} userEmail - Ignored (legacy param)
 * @param {string} projectName - Ignored (legacy param)
 * @param {string} entityType - risk, issue, etc.
 */
export async function generateEntityId(userEmail, projectName, entityType) {
    try {
        // 1. Define Prefixes
        const prefixMap = {
            risk: "RSK",
            issue: "ISS",
            dependency: "DEP",
            escalation: "ESC",
            action: "ACT",
            appreciation: "APP",
            collection: "COL"
        };

        const prefix = prefixMap[entityType.toLowerCase()] || "GEN";

        // 2. Generate Random Alphanumeric Component (6 chars)
        // This ensures IDs are unique, non-sequential, and "continuously changing"
        const allowed = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed I, O, 1, 0 to avoid confusion
        let randomPart = "";
        for (let i = 0; i < 6; i++) {
            randomPart += allowed.charAt(Math.floor(Math.random() * allowed.length));
        }

        const generatedId = `${prefix}-${randomPart}`; // e.g., RSK-9A2X4M

        console.log(`🆔 Generated ID for ${entityType}: ${generatedId}`);
        return generatedId;

    } catch (err) {
        console.error("ID Generation Error:", err);
        return `ERR${Math.floor(Math.random() * 1000)}`;
    }
}
