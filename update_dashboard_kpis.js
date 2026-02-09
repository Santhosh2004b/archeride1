
import { readFileSync, writeFileSync } from 'fs';

// PATHS
const backendPath = 'c:\\Users\\Santhosh B\\Downloads\\uagpl\\archeride1.0-main\\backend\\controllers\\dashboard.controller.js';
const frontendPath = 'c:\\Users\\Santhosh B\\Downloads\\uagpl\\archeride1.0-main\\frontend\\my-react-app\\src\\pages\\MonitoringDashboardPage.jsx';

function fixBackend() {
    try {
        let content = readFileSync(backendPath, 'utf8');

        // Pattern to find the block we edited before
        const startMarker = "const resolved = await safeCount(`";
        // We want to replace everything from `const resolved` down to the end of `const cancelled` block?
        // Or just look for the known structure.

        // Let's replace the Logic Block for 'resolved' and 'cancelled' with 'resolved', 'approved', 'cancelled'

        // We'll target the text:
        // const resolved = await safeCount(` ... );
        // ...
        // const cancelled = await safeCount(` ... );

        // To be safe, let's find the start of `const resolved` and the start of `const total_items`.
        const startIdx = content.indexOf("const resolved = await safeCount(`");
        const endIdx = content.indexOf("const total_items = await safeValue(`");

        if (startIdx !== -1 && endIdx !== -1) {
            const newBlock = `const resolved = await safeCount(\`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Resolved' \${pCond}
        UNION ALL SELECT id FROM issues WHERE status = 'Resolved' \${pCond}
        UNION ALL SELECT id FROM actions WHERE status = 'Resolved' \${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status = 'Resolved' \${pCond}
        UNION ALL SELECT id FROM escalations WHERE status = 'Resolved' \${pCond}
      ) t
    \`, kpiParams);

    const approved = await safeCount(\`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Approved & Closed' \${pCond}
        UNION ALL SELECT id FROM issues WHERE status = 'Approved & Closed' \${pCond}
        UNION ALL SELECT id FROM actions WHERE status = 'Approved & Closed' \${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status = 'Approved & Closed' \${pCond}
        UNION ALL SELECT id FROM escalations WHERE status = 'Approved & Closed' \${pCond}
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
    \`, kpiParams);

    `;

            // Extract the part we are replacing to ensure we don't eat too much
            const oldBlock = content.substring(startIdx, endIdx);
            // We assume oldBlock contains 'const cancelled' if it was added.

            content = content.replace(oldBlock, newBlock);

            // Update response object
            // Look for: resolved: resolved,
            // Insert: approved: approved,
            if (content.indexOf("approved: approved,") === -1) {
                content = content.replace("resolved: resolved,", "resolved: resolved,\n      approved: approved,");
            }

            writeFileSync(backendPath, content);
            console.log("Backend updated: Resolved, Approved, Cancelled separated.");
        } else {
            console.log("Backend: Could not find code blocks to replace.");
        }
    } catch (e) { console.error("Backend error:", e); }
}

function fixFrontend() {
    try {
        let content = readFileSync(frontendPath, 'utf8');

        // 1. Update setKpis to include totalApproved
        if (content.indexOf("totalApproved:") === -1) {
            // Insert after totalClosed (or resolved)
            content = content.replace(
                /totalClosed: Number\(data\.resolved \?\? 0\),/,
                "totalClosed: Number(data.resolved ?? 0),\n          totalApproved: Number(data.approved ?? 0),"
            );
        }

        // 2. Update KPI Cards
        // Find the block of cards.
        // We look for "Total Open" and replace the block.
        const startCard = '<KpiCard title="Total Open"';
        const endDiv = '</div>'; // This is risky if logic uses multiple divs.

        // Better: Match the whole inner content of the div
        const divContentRegex = /<KpiCard title="Total Open"[\s\S]*?<KpiCard title="Total Items"[\s\S]*?\/>\s*<\/div>/;

        if (divContentRegex.test(content)) {
            // We want to replace the content inside the parent div?
            // Actually, let's just replace the specific <div ...> ... </div> structure if we can identify it unique enough.
            // It has `justifyContent: "space-between"`

            // Easier: Replace the list of cards.
            // Regex for the cards themselves
            const cardsRegex = /<KpiCard title="Total Open"[\s\S]*?<KpiCard title="Total Items"[^>]*\/>/;

            const newCards = `<KpiCard title="Total Open" value={kpis.totalOpen} />
              <KpiCard title="Resolved" value={kpis.totalClosed} />
              <KpiCard title="Approved & Closed" value={kpis.totalApproved} />
              <KpiCard title="Cancelled" value={kpis.totalCancelled} />
              <KpiCard title="Total Items" value={kpis.totalItems} />`;

            content = content.replace(cardsRegex, newCards);
            console.log("Frontend updated: Added Approved & Closed card.");
        } else {
            console.log("Frontend: Could not find KPI cards to update.");
            // Debug
            console.log(content.substring(content.indexOf('Total Open') - 50, content.indexOf('Total Open') + 200));
        }

        writeFileSync(frontendPath, content);
    } catch (e) { console.error("Frontend error:", e); }
}

fixBackend();
fixFrontend();
