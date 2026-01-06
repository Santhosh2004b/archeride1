import pool from "../db.js";

/* ======================================================
   CREATE ADMIN NOTIFICATION (BM → ADMIN)
====================================================== */
export async function createResolutionNotification({
  module,
  itemId,
  itemCode,
  statusBefore,
  statusAfter, // should be "Resolved"
  payload,
  bmUser,
}) {
  const sql = `
    INSERT INTO notifications (
      module,
      item_id,
      item_code,
      status_before,
      status_after,
      payload,
      bm_user
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *;
  `;

  const { rows } = await pool.query(sql, [
    module,
    itemId,
    itemCode || null,
    statusBefore || null,
    statusAfter || null,
    payload ? JSON.stringify(payload) : null,
    bmUser || null,
  ]);

  return rows[0];
}

/* ======================================================
   ADMIN DECISION (CORE GOVERNANCE LOGIC)
====================================================== */
export async function decideNotification({ id, adminUser, decision, comment }) {
  // 1. Update notification
  const notifSql = `
    UPDATE notifications
    SET admin_user = $2,
        decision   = $3,
        comment    = $4,
        decided_at = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  const { rows } = await pool.query(notifSql, [
    id,
    adminUser || null,
    decision,
    comment || null,
  ]);

  const notif = rows[0];
  if (!notif) throw new Error("Notification not found");

  // 2. Apply FINAL status to actual module table
  const FINAL_STATUS =
    decision === "Closed" ? "Approved & Closed" : "On Hold";

  const TABLE_MAP = {
    risk: "risks",
    issue: "issues",
    dependency: "dependencies",
    escalation: "escalations",
    action: "actions",
  };

  const table = TABLE_MAP[notif.module];
  if (table) {
    await pool.query(
      `UPDATE ${table} SET status = $1 WHERE id = $2`,
      [FINAL_STATUS, notif.item_id]
    );

    // 🔔 Notify the BM who sent this
    if (notif.bm_user) {
      const bmTable = `bm_${notif.module}_notifications`;
      const idCol = `${notif.module}_id`;
      await pool.query(
        `INSERT INTO ${bmTable} (${idCol}, bm_email, decision, comment, created_at, is_read)
         VALUES ($1,$2,$3,$4,NOW(),false)`,
        [notif.item_id, notif.bm_user, decision, comment]
      );
    }
  }

  return notif;
}

/* ======================================================
   ADMIN – LIST PENDING (ONLY RESOLVED)
====================================================== */
function baseAdminQuery(module, table, titleCol) {
  return `
    SELECT DISTINCT ON (n.item_id)
           n.*,
           t.${titleCol} AS title,
           
           COALESCE(t.project_name, p.name) AS project_name,
           t.status,
           t.priority

    FROM notifications n
    JOIN ${table} t ON t.id = n.item_id

    -- 🔥 fix project lookup
    LEFT JOIN projects p
      ON (t.project_id IS NOT NULL AND p.id = t.project_id)
      OR (t.project_name IS NOT NULL AND p.name = t.project_name)

    -- 🔥 show notifications even if project mapping fails
    WHERE n.module = '${module}'
      AND n.decision IS NULL
      AND (t.status ILIKE '%resolved%' OR n.status_after = 'Resolved')

    ORDER BY n.item_id, n.created_at DESC;
  `;
}



export async function listPendingRiskNotifications() {
  const { rows } = await pool.query(
    baseAdminQuery("risk", "risks", "risk_title")
  );
  return rows;
}

export async function listPendingIssueNotifications() {
  const { rows } = await pool.query(
    baseAdminQuery("issue", "issues", "issue_title")
  );
  return rows;
}

export async function listPendingDependencyNotifications() {
  const { rows } = await pool.query(
    baseAdminQuery("dependency", "dependencies", "dependency_title")
  );
  return rows;
}

export async function listPendingEscalationNotifications() {
  const { rows } = await pool.query(
    baseAdminQuery("escalation", "escalations", "title")
  );
  return rows;
}

export async function listPendingActionNotifications() {
  const { rows } = await pool.query(
    baseAdminQuery("action", "actions", "action_title")
  );
  return rows;
}

/* ======================================================
   ADMIN BELL COUNTS
====================================================== */
async function countAdmin(module, table) {
  const { rows } = await pool.query(`
    SELECT COUNT(*) AS c
    FROM notifications n
    JOIN ${table} t ON t.id = n.item_id
    WHERE n.module = '${module}'
      AND n.decision IS NULL
      AND t.status = 'Resolved'
  `);
  return Number(rows[0].c || 0);
}

export const countAdminPendingRiskNotifications = () =>
  countAdmin("risk", "risks");
export const countAdminPendingIssueNotifications = () =>
  countAdmin("issue", "issues");
export const countAdminPendingDependencyNotifications = () =>
  countAdmin("dependency", "dependencies");
export const countAdminPendingEscalationNotifications = () =>
  countAdmin("escalation", "escalations");
export const countAdminPendingActionNotifications = () =>
  countAdmin("action", "actions");

/* ======================================================
   BM NOTIFICATION LISTS
====================================================== */
// BM – generic list for any module from the main notifications table
export async function listBmNotificationsByModule(email, module) {
  const sql = `
    SELECT n.*,
           (n.payload->>'project_name') as project_name,
           (n.payload->>'priority') as priority,
           (n.payload->>'risk_title') as risk_title,
           (n.payload->>'issue_title') as issue_title,
           (n.payload->>'dependency_title') as dependency_title,
           (n.payload->>'action_title') as action_title,
           (n.payload->>'title') as title
    FROM notifications n
    WHERE n.bm_user = $1 AND n.module = $2
    ORDER BY n.created_at DESC
  `;
  const { rows } = await pool.query(sql, [email, module]);
  return rows;
}

export async function listBmRiskNotifications(email) {
  return listBmNotificationsByModule(email, "risk");
}

export async function listBmIssueNotifications(email) {
  return listBmNotificationsByModule(email, "issue");
}

export async function listBmDependencyNotifications(email) {
  return listBmNotificationsByModule(email, "dependency");
}

export async function listBmEscalationNotifications(email) {
  return listBmNotificationsByModule(email, "escalation");
}

export async function listBmActionNotifications(email) {
  return listBmNotificationsByModule(email, "action");
}

/* ======================================================
   BM BELL COUNT
====================================================== */
export async function countBmNotifications(email) {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM bm_risk_notifications WHERE bm_email=$1 AND is_read=false) +
      (SELECT COUNT(*) FROM bm_issue_notifications WHERE bm_email=$1 AND is_read=false) +
      (SELECT COUNT(*) FROM bm_dependency_notifications WHERE bm_email=$1 AND is_read=false) +
      (SELECT COUNT(*) FROM bm_escalation_notifications WHERE bm_email=$1 AND is_read=false) +
      (SELECT COUNT(*) FROM bm_action_notifications WHERE bm_email=$1 AND is_read=false)
    AS c
  `;
  const { rows } = await pool.query(sql, [email]);
  return Number(rows[0].c || 0);
}

/* ======================================================
   CREATE BM NOTIFICATIONS (AFTER ADMIN DECISION)
====================================================== */
async function createBmNotification(table, idCol, id, bmEmail, decision, comment) {
  await pool.query(
    `
    INSERT INTO ${table} (${idCol}, bm_email, decision, comment, created_at, is_read)
    VALUES ($1,$2,$3,$4,NOW(),false)
  `,
    [id, bmEmail, decision, comment]
  );
}

export const createBmNotificationForRiskDecision = (p) =>
  createBmNotification(
    "bm_risk_notifications",
    "risk_id",
    p.riskId,
    p.bmEmail,
    p.decision,
    p.comment
  );

export const createBmNotificationForIssueDecision = (p) =>
  createBmNotification(
    "bm_issue_notifications",
    "issue_id",
    p.issueId,
    p.bmEmail,
    p.decision,
    p.comment
  );

export const createBmNotificationForDependencyDecision = (p) =>
  createBmNotification(
    "bm_dependency_notifications",
    "dependency_id",
    p.dependencyId,
    p.bmEmail,
    p.decision,
    p.comment
  );

export const createBmNotificationForEscalationDecision = (p) =>
  createBmNotification(
    "bm_escalation_notifications",
    "escalation_id",
    p.escalationId,
    p.bmEmail,
    p.decision,
    p.comment
  );

export const createBmNotificationForActionDecision = (p) =>
  createBmNotification(
    "bm_action_notifications",
    "action_id",
    p.actionId,
    p.bmEmail,
    p.decision,
    p.comment
  );
