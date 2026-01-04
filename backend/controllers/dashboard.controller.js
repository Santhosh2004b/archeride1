// filepath: backend/controllers/dashboard.controller.js
import pool from "../config/db.config.js";

// Helper: safely get first row count
const safeCount = async (sql) => {
  try {
    const res = await pool.query(sql);
    return Number(res.rows[0]?.count || 0);
  } catch {
    return 0;
  }
};

// Helper: safely get aggregate value
const safeValue = async (sql, field) => {
  try {
    const res = await pool.query(sql);
    return Number(res.rows[0]?.[field] || 0);
  } catch {
    return 0;
  }
};

// ---------------------------------------------
// GET /dashboard/metrics
// Returns KPI cards, pie, trend, sparklines, tables
// Query params: year (optional, defaults to current year)
export async function getDashboardMetrics(req, res) {
  try {
    // Get year from query param, default to current year
    const currentYear = new Date().getFullYear();
    const selectedYear = parseInt(req.query.year) || currentYear;
    // For weekly action filter:
    const weekStartParam = req.query.week_start || null;
    // ---------- KPI CARD DATA: count by status across ALL modules ----------
    const total_open = await safeCount(`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Open'
        UNION ALL SELECT id FROM issues WHERE status = 'Open'
        UNION ALL SELECT id FROM actions WHERE status = 'Open'
        UNION ALL SELECT id FROM dependencies WHERE status = 'Open'
        UNION ALL SELECT id FROM escalations WHERE status = 'Open'
        UNION ALL SELECT id FROM collections WHERE status = 'Open'
      ) t
    `);

    const inholding = await safeCount(`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'In Progress' OR status = 'on-holding'
        UNION ALL SELECT id FROM issues WHERE status = 'In Progress' OR status = 'on-holding'
        UNION ALL SELECT id FROM actions WHERE status = 'In Progress' OR status = 'on-holding'
        UNION ALL SELECT id FROM dependencies WHERE status = 'In Progress' OR status = 'on-holding'
        UNION ALL SELECT id FROM escalations WHERE status = 'In Progress' OR status = 'on-holding'
        UNION ALL SELECT id FROM collections WHERE status = 'In Progress' OR status = 'on-holding'
      ) t
    `);

    const resolved = await safeCount(`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Resolved' OR status = 'Approved & Closed'
        UNION ALL SELECT id FROM issues WHERE status = 'Resolved' OR status = 'Approved & Closed'
        UNION ALL SELECT id FROM actions WHERE status = 'Resolved' OR status = 'Approved & Closed'
        UNION ALL SELECT id FROM dependencies WHERE status = 'Resolved' OR status = 'Approved & Closed'
        UNION ALL SELECT id FROM escalations WHERE status = 'Resolved' OR status = 'Approved & Closed'
        UNION ALL SELECT id FROM collections WHERE status = 'Resolved' OR status = 'Approved & Closed'
      ) t
    `);

    const total_items = await safeValue(`
      SELECT 
        (SELECT COUNT(*) FROM risks) +
        (SELECT COUNT(*) FROM issues) +
        (SELECT COUNT(*) FROM actions) +
        (SELECT COUNT(*) FROM dependencies) +
        (SELECT COUNT(*) FROM escalations) +
        (SELECT COUNT(*) FROM collections) AS total
    `, 'total');

    // ---------- PIE: priority split (from risks) ----------
    const prioritySplit = [];
    try {
      const res = await pool.query(`
        SELECT priority, COUNT(*)::INT AS count 
        FROM risks 
        WHERE priority IS NOT NULL
        GROUP BY priority
        ORDER BY priority
      `);
      res.rows.forEach(r => {
        prioritySplit.push({
          priority: r.priority || 'Unknown',
          count: r.count
        });
      });
    } catch (e) {
      console.error('Priority split error:', e);
    }

    // ---------- MONTHLY TREND: risk trend by month (filtered by selected year) ----------
    const monthly_risk_trend = [];
    try {
      // Generate array of all 12 months
      const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Get actual data from database
      const res = await pool.query(`
        SELECT TO_CHAR(identified_date, 'Mon') AS month, COUNT(*)::INT AS count
        FROM risks
        WHERE identified_date IS NOT NULL 
          AND EXTRACT(YEAR FROM identified_date) = $1
        GROUP BY TO_CHAR(identified_date, 'Mon'), EXTRACT(MONTH FROM identified_date)
        ORDER BY EXTRACT(MONTH FROM identified_date)
      `, [selectedYear]);

      // Create map of existing months
      const monthMap = {};
      res.rows.forEach(r => {
        monthMap[r.month] = r.count;
      });

      // Fill in all 12 months with zero for missing
      allMonths.forEach(month => {
        monthly_risk_trend.push({
          month,
          count: monthMap[month] || 0
        });
      });
    } catch (e) {
      console.error('Monthly trend error:', e);
    }

    // ---------- AVAILABLE YEARS: for year selector ----------
    const available_years = [];
    try {
      const res = await pool.query(`
        SELECT DISTINCT EXTRACT(YEAR FROM identified_date)::INT AS year
        FROM risks
        WHERE identified_date IS NOT NULL
        ORDER BY year DESC
      `);
      res.rows.forEach(r => {
        available_years.push(r.year);
      });
    } catch (e) {
      console.error('Available years error:', e);
    }

    // ---------- SPARKLINE: trend collections ----------
    const trend_collections = [];
    try {
      const res = await pool.query(`
        SELECT COUNT(*)::INT AS value
        FROM collections
        GROUP BY TO_CHAR(COALESCE(invoice_date, created_at), 'Mon')
        ORDER BY MIN(COALESCE(invoice_date, created_at))
        LIMIT 6
      `);
      res.rows.forEach(r => {
        trend_collections.push({ value: r.value });
      });
    } catch (e) {
      console.error('Trend collections error:', e);
    }

    // ---------- SPARKLINE: trend closed issues ----------
    const trend_closed = [];
    try {
      const res = await pool.query(`
        SELECT COUNT(*)::INT AS value
        FROM issues
        WHERE status = 'Resolved' OR status = 'Approved & Closed'
        GROUP BY TO_CHAR(COALESCE(actual_resolution_date, updated_at), 'Mon')
        ORDER BY MIN(COALESCE(actual_resolution_date, updated_at))
        LIMIT 6
      `);
      res.rows.forEach(r => {
        trend_closed.push({ value: r.value });
      });
    } catch (e) {
      console.error('Trend closed error:', e);
    }

    // ---------- SPARKLINE: trend escalations ----------
    const trend_escalations = [];
    try {
      const res = await pool.query(`
        SELECT COUNT(*)::INT AS value
        FROM escalations
        GROUP BY TO_CHAR(COALESCE(reported_date, created_at), 'Mon')
        ORDER BY MIN(COALESCE(reported_date, created_at))
        LIMIT 6
      `);
      res.rows.forEach(r => {
        trend_escalations.push({ value: r.value });
      });
    } catch (e) {
      console.error('Trend escalations error:', e);
    }

    // ---------- ACTION COMPLETION % ----------
    // Corrected: Count completed actions vs total actions * 100
    const action_completion_percent = await safeValue(`
      SELECT COALESCE(
        ROUND(
          (COUNT(CASE WHEN status = 'Resolved' OR status = 'Approved & Closed' THEN 1 END)::FLOAT / 
           NULLIF(COUNT(*), 0) * 100)
        )::INT, 
        0
      ) AS pct
      FROM actions
    `, 'pct');

    // ---------- WEEKLY ACTION STATUS (REPLACES COMPLETION %) ----------
    const weekly_action_status = {
      week_label: "",
      Open: 0,
      Inholding: 0,
      Resolved: 0
    };

    // 1. Get available weeks for dropdown
    const available_action_weeks = [];
    try {
      const res = await pool.query(`
        SELECT DISTINCT 
          DATE_TRUNC('week', created_at)::DATE as week_start,
          TO_CHAR(created_at, 'W') as week_num,
          TO_CHAR(created_at, 'Mon') as month_str
        FROM actions
        WHERE created_at IS NOT NULL
        ORDER BY week_start DESC
      `);
      res.rows.forEach(r => {
        // Format: "Week 2 — Nov"
        const label = `Week ${r.week_num} — ${r.month_str}`;
        // Unique key for frontend: YYYY-MM-DD of week start
        // but let's just send week_start string
        const val =
          new Date(r.week_start).getFullYear() + '-' +
          String(new Date(r.week_start).getMonth() + 1).padStart(2, '0') + '-' +
          String(new Date(r.week_start).getDate()).padStart(2, '0');

        available_action_weeks.push({
          value: val,
          label: label
        });
      });
    } catch (e) {
      console.error('Available action weeks error:', e);
    }

    // 2. Decide which week to filter by
    // If param provided, use it. Else use latest available week.
    let targetWeekStart = weekStartParam;
    if (!targetWeekStart && available_action_weeks.length > 0) {
      targetWeekStart = available_action_weeks[0].value;
    }

    // 3. Get status counts for that week
    if (targetWeekStart) {
      try {
        const res = await pool.query(`
          SELECT 
            SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::INT as open_count,
            SUM(CASE WHEN status IN ('In Progress', 'on-holding') THEN 1 ELSE 0 END)::INT as inholding_count,
            SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed') THEN 1 ELSE 0 END)::INT as resolved_count
          FROM actions
          WHERE DATE_TRUNC('week', created_at)::DATE = $1
        `, [targetWeekStart]);

        if (res.rows.length > 0) {
          const row = res.rows[0];
          weekly_action_status.Open = row.open_count || 0;
          weekly_action_status.Inholding = row.inholding_count || 0;
          weekly_action_status.Resolved = row.resolved_count || 0;

          // Find label for response
          const found = available_action_weeks.find(w => w.value === targetWeekStart);
          weekly_action_status.week_label = found ? found.label : targetWeekStart;
        }
      } catch (e) {
        console.error('Weekly action status error:', e);
      }
    }

    // ---------- LATEST TABLE FEEDS ----------
    const latest_risks = [];
    try {
      const res = await pool.query(`
        SELECT 
          risk_id, risk_title, priority, status, 
          COALESCE(project_name, '-') as project_name,
          COALESCE(identified_date::text, '-') as identified_date,
          COALESCE(identified_by, '-') as identified_by,
          current_status
        FROM risks
        ORDER BY COALESCE(updated_at, created_at) DESC
      `);
      latest_risks.push(...res.rows);
    } catch (e) {
      console.error('Latest risks error:', e);
    }

    const latest_issues = [];
    try {
      const res = await pool.query(`
        SELECT 
          issue_id, issue_title, priority, status,
          COALESCE(project_name, '-') as project_name,
          COALESCE(reported_date::text, '-') as identified_date
        FROM issues
        ORDER BY COALESCE(updated_at, created_at) DESC
      `);
      latest_issues.push(...res.rows);
    } catch (e) {
      console.error('Latest issues error:', e);
    }

    const latest_collections = [];
    try {
      const res = await pool.query(`
        SELECT 
          invoice_id, customer_name, invoice_amount, status, payment_status, project_name, last_updated,
          COALESCE(days_overdue, CASE WHEN status != 'Paid' THEN GREATEST(0, (EXTRACT(EPOCH FROM (NOW() - due_date)) / 86400)::INT) ELSE 0 END) as days_overdue,
          COALESCE(amount_received, 0) as amount_received,
          COALESCE(outstanding_amount, invoice_amount - COALESCE(amount_received, 0)) as outstanding_amount
        FROM collections
        ORDER BY COALESCE(updated_at, created_at) DESC
      `);
      latest_collections.push(...res.rows);
    } catch (e) {
      console.error('Latest collections error:', e);
    }

    const latest_dependencies = [];
    try {
      // Dependency matrix removed from UI, returning empty to prevent errors
      // const res = await pool.query(...);
      latest_dependencies.push(...[]);
    } catch (e) {
      console.error('Latest dependencies error:', e);
    }

    const latest_actions = [];
    try {
      const res = await pool.query(`
        SELECT action_id, action_title, priority, status
        FROM actions
        ORDER BY COALESCE(updated_at, created_at) DESC
      `);
      latest_actions.push(...res.rows);
    } catch (e) {
      console.error('Latest actions error:', e);
    }

    // ---------- STATUS BY MODULE: accurate counts ----------
    const module_status = [];
    try {
      // Risks
      const risks_res = await pool.query(`
        SELECT 
          'Risk' AS module,
          SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::INT AS open_count,
          SUM(CASE WHEN status IN ('In Progress', 'on-holding') THEN 1 ELSE 0 END)::INT AS inholding_count,
          SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed') THEN 1 ELSE 0 END)::INT AS resolved_count,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::INT AS cancelled_count
        FROM risks
      `);
      if (risks_res.rows[0]) {
        module_status.push({
          module: 'Risk',
          Open: risks_res.rows[0].open_count || 0,
          Inholding: risks_res.rows[0].inholding_count || 0,
          Resolved: risks_res.rows[0].resolved_count || 0,
          Cancelled: risks_res.rows[0].cancelled_count || 0
        });
      }

      // Issues
      const issues_res = await pool.query(`
        SELECT 
          'Issue' AS module,
          SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::INT AS open_count,
          SUM(CASE WHEN status IN ('In Progress', 'on-holding') THEN 1 ELSE 0 END)::INT AS inholding_count,
          SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed') THEN 1 ELSE 0 END)::INT AS resolved_count,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::INT AS cancelled_count
        FROM issues
      `);
      if (issues_res.rows[0]) {
        module_status.push({
          module: 'Issue',
          Open: issues_res.rows[0].open_count || 0,
          Inholding: issues_res.rows[0].inholding_count || 0,
          Resolved: issues_res.rows[0].resolved_count || 0,
          Cancelled: issues_res.rows[0].cancelled_count || 0
        });
      }

      // Dependencies
      const deps_res = await pool.query(`
        SELECT 
          'Dependency' AS module,
          SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::INT AS open_count,
          SUM(CASE WHEN status IN ('In Progress', 'on-holding') THEN 1 ELSE 0 END)::INT AS inholding_count,
          SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed') THEN 1 ELSE 0 END)::INT AS resolved_count,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::INT AS cancelled_count
        FROM dependencies
      `);
      if (deps_res.rows[0]) {
        module_status.push({
          module: 'Dependency',
          Open: deps_res.rows[0].open_count || 0,
          Inholding: deps_res.rows[0].inholding_count || 0,
          Resolved: deps_res.rows[0].resolved_count || 0,
          Cancelled: deps_res.rows[0].cancelled_count || 0
        });
      }

      // Actions
      const actions_res = await pool.query(`
        SELECT 
          'Action' AS module,
          SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::INT AS open_count,
          SUM(CASE WHEN status IN ('In Progress', 'on-holding') THEN 1 ELSE 0 END)::INT AS inholding_count,
          SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed') THEN 1 ELSE 0 END)::INT AS resolved_count,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::INT AS cancelled_count
        FROM actions
      `);
      if (actions_res.rows[0]) {
        module_status.push({
          module: 'Action',
          Open: actions_res.rows[0].open_count || 0,
          Inholding: actions_res.rows[0].inholding_count || 0,
          Resolved: actions_res.rows[0].resolved_count || 0,
          Cancelled: actions_res.rows[0].cancelled_count || 0
        });
      }

      // Collections
      const collections_res = await pool.query(`
        SELECT 
          'Collection' AS module,
          SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::INT AS open_count,
          SUM(CASE WHEN status IN ('In Progress', 'on-holding') THEN 1 ELSE 0 END)::INT AS inholding_count,
          SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed') THEN 1 ELSE 0 END)::INT AS resolved_count,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::INT AS cancelled_count
        FROM collections
      `);
      if (collections_res.rows[0]) {
        module_status.push({
          module: 'Collection',
          Open: collections_res.rows[0].open_count || 0,
          Inholding: collections_res.rows[0].inholding_count || 0,
          Resolved: collections_res.rows[0].resolved_count || 0,
          Cancelled: collections_res.rows[0].cancelled_count || 0
        });
      }
    } catch (e) {
      console.error('Module status error:', e);
    }
    return res.json({
      total_open,
      inholding,
      resolved,
      total_items,

      priority_split: prioritySplit,
      monthly_risk_trend,
      available_years,
      selected_year: selectedYear,

      trend_collections,
      trend_closed,
      trend_escalations,

      action_completion_percent,
      action_completion_percent,
      weekly_action_status,       // Replaces weekly_action_completion
      available_action_weeks,     // New dropdown list
      selected_action_week: targetWeekStart,

      module_status,

      latest_risks,
      latest_issues,
      latest_collections,
      latest_dependencies,
      latest_actions
    });

  } catch (err) {
    console.error('DASHBOARD METRICS ERROR:', err);
    return res.status(500).json({
      error: 'metrics_fetch_failed',
      message: err.message
    });
  }
}
