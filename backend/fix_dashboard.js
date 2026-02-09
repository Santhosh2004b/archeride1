
import { readFileSync, writeFileSync } from 'fs';
const path = 'c:\\Users\\Santhosh B\\Downloads\\uagpl\\archeride1.0-main\\backend\\controllers\\dashboard.controller.js';

try {
    let content = readFileSync(path, 'utf8');

    // The string to find
    const oldQueryFragment = "status IN ('Resolved', 'Approved & Closed', 'Cancelled')";

    // Check if we find it multiple times (should be 5 times in the union)
    if (content.indexOf(oldQueryFragment) === -1) {
        console.log("Could not find the target query string. It might have been changed already.");
        process.exit(0);
    }

    // We need to replace the WHOLE resolved block.
    // Let's look for the start of the block
    const startMarker = "const resolved = await safeCount(`";
    const endMarker = "`, kpiParams);";

    const startIndex = content.indexOf(startMarker);
    if (startIndex === -1) throw new Error("Start marker not found");

    const endIndex = content.indexOf(endMarker, startIndex);
    if (endIndex === -1) throw new Error("End marker not found");

    const originalBlock = content.substring(startIndex, endIndex + endMarker.length);

    // Construct new block
    const newResolvedBlock = `const resolved = await safeCount(\`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status IN ('Resolved', 'Approved & Closed') \${pCond}
        UNION ALL SELECT id FROM issues WHERE status IN ('Resolved', 'Approved & Closed') \${pCond}
        UNION ALL SELECT id FROM actions WHERE status IN ('Resolved', 'Approved & Closed') \${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status IN ('Resolved', 'Approved & Closed') \${pCond}
        UNION ALL SELECT id FROM escalations WHERE status IN ('Resolved', 'Approved & Closed') \${pCond}
      ) t
    \`, kpiParams);

    const cancelled = await safeCount(\`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Cancelled' \${pCond}
        UNION ALL SELECT id FROM issues WHERE status = 'Cancelled' \${pCond}
        UNION ALL SELECT id FROM actions WHERE status = 'Cancelled' \${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status = 'Cancelled' \${pCond}
        UNION ALL SELECT id FROM escalations WHERE status = 'Cancelled' \${pCond}
      ) t
    \`, kpiParams);`;

    const newContent = content.replace(originalBlock, newResolvedBlock);

    writeFileSync(path, newContent);
    console.log("Successfully separated resolved and cancelled queries.");

} catch (err) {
    console.error("Error fixing dashboard:", err);
}
