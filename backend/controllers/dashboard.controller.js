
import pool from "../db.js";


const safeCount = async (sql, params = []) => {
  try {
    const res = await pool.query(sql, params);
    return Number(res.rows[0]?.count || 0);
  } catch {
    return 0;
  }
};


const safeValue = async (sql, field, params = []) => {
  try {
    const res = await pool.query(sql, params);
    return Number(res.rows[0]?.[field] || 0);
  } catch {
    return 0;
  }
};

export async function getDashboardMetrics(req, res) {
  try {
    const currentYear = new Date().getFullYear();
    const selectedYear = parseInt(req.query.year) || currentYear;

    const riskYear = parseInt(req.query.risk_year) || selectedYear;

    const priorityParam = req.query.priority || null;


    const kpiParams = [];
    let pCond = "";
    if (priorityParam) {
      pCond = " AND priority = $1 ";
      kpiParams.push(priorityParam);
    }



    const total_open = await safeCount(`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Open' ${pCond}
        UNION ALL SELECT id FROM issues WHERE status = 'Open' ${pCond}
        UNION ALL SELECT id FROM actions WHERE status = 'Open' ${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status = 'Open' ${pCond}
        UNION ALL SELECT id FROM escalations WHERE status = 'Open' ${pCond}
      ) t
    `, kpiParams);


    const total_on_hold = await safeCount(`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status IN ('In Progress', 'On Hold') ${pCond}
        UNION ALL SELECT id FROM issues WHERE status IN ('In Progress', 'On Hold') ${pCond}
        UNION ALL SELECT id FROM actions WHERE status IN ('In Progress', 'On Hold') ${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status IN ('In Progress', 'On Hold') ${pCond}
        UNION ALL SELECT id FROM escalations WHERE status IN ('In Progress', 'On Hold') ${pCond}
      ) t
    `, kpiParams);


    const resolved = await safeCount(`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Resolved' ${pCond}
        UNION ALL SELECT id FROM issues WHERE status = 'Resolved' ${pCond}
        UNION ALL SELECT id FROM actions WHERE status = 'Resolved' ${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status = 'Resolved' ${pCond}
        UNION ALL SELECT id FROM escalations WHERE status = 'Resolved' ${pCond}
      ) t
    `, kpiParams);

    const approved = await safeCount(`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Approved & Closed' ${pCond}
        UNION ALL SELECT id FROM issues WHERE status = 'Approved & Closed' ${pCond}
        UNION ALL SELECT id FROM actions WHERE status = 'Approved & Closed' ${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status = 'Approved & Closed' ${pCond}
        UNION ALL SELECT id FROM escalations WHERE status = 'Approved & Closed' ${pCond}
      ) t
    `, kpiParams);

    const cancelled = await safeCount(`
      SELECT COUNT(*) FROM (
        SELECT id FROM risks WHERE status = 'Cancelled' ${pCond}
        UNION ALL SELECT id FROM issues WHERE status = 'Cancelled' ${pCond}
        UNION ALL SELECT id FROM actions WHERE status = 'Cancelled' ${pCond}
        UNION ALL SELECT id FROM dependencies WHERE status = 'Cancelled' ${pCond}
        UNION ALL SELECT id FROM escalations WHERE status = 'Cancelled' ${pCond}
      ) t
    `, kpiParams);

    const total_items = await safeValue(`
      SELECT 
        (SELECT COUNT(*) FROM risks WHERE 1=1 ${pCond}) +
        (SELECT COUNT(*) FROM issues WHERE 1=1 ${pCond}) +
        (SELECT COUNT(*) FROM actions WHERE 1=1 ${pCond}) +
        (SELECT COUNT(*) FROM dependencies WHERE 1=1 ${pCond}) +
        (SELECT COUNT(*) FROM escalations WHERE 1=1 ${pCond}) AS total
    `, 'total', kpiParams);


    const prioritySplit = [];
    try {
      const res = await pool.query(`
        SELECT priority, COUNT(*)::INT AS count 
        FROM (
             SELECT priority FROM risks
   UNION ALL SELECT priority FROM issues
   UNION ALL SELECT priority FROM actions
   UNION ALL SELECT priority FROM dependencies
   UNION ALL SELECT priority FROM escalations
        ) t
        WHERE priority IS NOT NULL
        GROUP BY priority
        ORDER BY priority
      `);
      res.rows.forEach(r => {
        prioritySplit.push({ priority: r.priority || 'Unknown', count: r.count });
      });
    } catch (e) { console.error('Priority split error:', e); }


    const priority_by_module = {};
    const modulesToCheck = [
      { key: 'Risk', table: 'risks' },
      { key: 'Issue', table: 'issues' },
      { key: 'Action', table: 'actions' },
      { key: 'Dependency', table: 'dependencies' },
      { key: 'Escalation', table: 'escalations' }
    ];

    for (const m of modulesToCheck) {
      try {
        const res = await pool.query(`
          SELECT priority, COUNT(*)::INT as count
          FROM ${m.table}
          WHERE priority IS NOT NULL
          GROUP BY priority
        `);
        const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
        res.rows.forEach(r => {
          if (counts.hasOwnProperty(r.priority)) {
            counts[r.priority] = Number(r.count);
          }
        });
        priority_by_module[m.key] = counts;
      } catch (e) {
        console.error(`Priority split error for ${m.key}:`, e);
        priority_by_module[m.key] = { Critical: 0, High: 0, Medium: 0, Low: 0 };
      }
    }



    const monthly_risk_trend = [];
    try {
      const allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const trendParams = [riskYear];
      let trendWhere = " AND EXTRACT(YEAR FROM identified_date) = $1 ";
      if (priorityParam) {
        trendWhere += " AND priority = $2 ";
        trendParams.push(priorityParam);
      }

      const res = await pool.query(`
        SELECT TO_CHAR(identified_date, 'Mon') AS month, COUNT(*)::INT AS count
        FROM risks
        WHERE identified_date IS NOT NULL 
        ${trendWhere}
        GROUP BY TO_CHAR(identified_date, 'Mon'), EXTRACT(MONTH FROM identified_date)
        ORDER BY EXTRACT(MONTH FROM identified_date)
      `, trendParams);

      const monthMap = {};
      res.rows.forEach(r => { monthMap[r.month] = r.count; });
      allMonths.forEach(month => {
        monthly_risk_trend.push({ month, count: monthMap[month] || 0 });
      });
    } catch (e) { console.error('Monthly trend error:', e); }

    const available_years = [];
    try {
      const res = await pool.query(`
        SELECT DISTINCT EXTRACT(YEAR FROM identified_date)::INT AS year
        FROM risks
        WHERE identified_date IS NOT NULL
        ORDER BY year DESC
      `);
      res.rows.forEach(r => { available_years.push(r.year); });
    } catch (e) { console.error('Available years error:', e); }


    const module_status = [];
    const mods = [
      { name: 'Risk', table: 'risks' },
      { name: 'Issue', table: 'issues' },
      { name: 'Dependency', table: 'dependencies' },
      { name: 'Action', table: 'actions' },
      { name: 'Escalation', table: 'escalations' }
    ];

    for (const m of mods) {

      const modParams = priorityParam ? [priorityParam] : [];
      const modCond = priorityParam ? " AND priority = $1 " : "";

      const r = await pool.query(`
        SELECT 
          SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::INT AS open_count,
          SUM(CASE WHEN status IN ('In Progress', 'On Hold') THEN 1 ELSE 0 END)::INT AS on_hold_count,
          SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed') THEN 1 ELSE 0 END)::INT AS resolved_count,
          SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END)::INT AS cancelled_count
        FROM ${m.table}
        WHERE 1=1 ${modCond}
      `, modParams);

      module_status.push({
        module: m.name,
        Open: r.rows[0].open_count || 0,
        "On Hold": r.rows[0].on_hold_count || 0,
        Resolved: r.rows[0].resolved_count || 0,
        Cancelled: r.rows[0].cancelled_count || 0
      });
    }


    const latestWhere = priorityParam ? " WHERE priority = $1 " : "";
    const latestParams = priorityParam ? [priorityParam] : [];

    const latest_risks = (await pool.query(`SELECT risk_id, risk_title, priority, status, account, identified_date, updated_at FROM risks ${latestWhere} ORDER BY updated_at DESC`, latestParams)).rows;
    const latest_issues = (await pool.query(`SELECT issue_id, issue_title, priority, status, account, reported_date as identified_date, updated_at FROM issues ${latestWhere} ORDER BY updated_at DESC`, latestParams)).rows;
    const latest_actions = (await pool.query(`SELECT action_id, action_title, priority, status, updated_at FROM actions ${latestWhere} ORDER BY updated_at DESC`, latestParams)).rows;
    const latest_dependencies = (await pool.query(`SELECT dependency_id, dependency_title, priority, status, updated_at FROM dependencies ${latestWhere} ORDER BY updated_at DESC`, latestParams)).rows;





    let top_priority_items = [];
    try {




      const priorityLimit = 10;

      const sql = `
        SELECT * FROM (
          SELECT 
            'Risk' as type, 
            risk_id as id, 
            risk_title as title, 
            project_description as project, 
            priority, 
            impact, 
            risk_score,
            updated_at
          FROM risks 
          WHERE (priority IN ('Critical', 'High') OR impact IN ('Major', 'Critical')) 
            AND status NOT IN ('Resolved', 'Cancelled', 'Approved & Closed')

          UNION ALL

          SELECT 
            'Issue' as type, 
            issue_id as id, 
            issue_title as title, 
            project_description as project, 
            priority, 
            NULL as impact, 
            NULL as risk_score,
            updated_at
          FROM issues 
          WHERE priority IN ('Critical', 'High')
            AND status NOT IN ('Resolved', 'Cancelled', 'Approved & Closed')

          UNION ALL

          SELECT 
            'Escalation' as type, 
            escalation_id as id, 
            title as title, 
            project_description as project, 
            priority, 
            impact, 
            NULL as risk_score,
            updated_at
          FROM escalations 
          WHERE priority IN ('Critical', 'High')
            AND status NOT IN ('Resolved', 'Cancelled', 'Approved & Closed')
        ) as combined
        ORDER BY 
          CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 ELSE 3 END ASC,
          updated_at DESC
        LIMIT 20
      `;

      const res = await pool.query(sql);
      top_priority_items = res.rows;
    } catch (e) {
      console.error("Top priority items error", e);
    }





    const actionWeeksParams = priorityParam ? [priorityParam] : [];
    const actionWeeksWhere = priorityParam ? " AND priority = $1 " : "";


    const available_action_weeks = [];
    try {
      const res = await pool.query(`
        SELECT DISTINCT DATE_TRUNC('week', created_date)::DATE as week_start
        FROM actions
        WHERE created_date IS NOT NULL ${actionWeeksWhere}
        ORDER BY week_start DESC
      `, actionWeeksParams);
      res.rows.forEach(r => {

        const d = new Date(r.week_start);
        const val = d.toISOString().split('T')[0];
        available_action_weeks.push({ value: val, label: `Week of ${val}` });
      });
    } catch (e) { console.error('Available action weeks error:', e); }

    let selectedWeek = req.query.week_start;

    if (!selectedWeek && available_action_weeks.length > 0) {
      selectedWeek = available_action_weeks[0].value;
    }

    const weekly_action_status = { week_label: selectedWeek || "Current", Open: 0, "On Hold": 0, Resolved: 0 };
    if (selectedWeek) {
      const weekParams = [selectedWeek];
      let weekWhere = " AND DATE_TRUNC('week', created_date)::DATE = $1 ";
      if (priorityParam) {
        weekWhere += " AND priority = $2 ";
        weekParams.push(priorityParam);
      }

      try {
        const res = await pool.query(`
          SELECT 
            SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END)::INT as open_c,
            SUM(CASE WHEN status IN ('In Progress', 'On Hold') THEN 1 ELSE 0 END)::INT as hold_c,
            SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed', 'Cancelled') THEN 1 ELSE 0 END)::INT as res_c
          FROM actions
          WHERE created_date IS NOT NULL ${weekWhere}
        `, weekParams);

        if (res.rows.length) {
          weekly_action_status.Open = res.rows[0].open_c;
          weekly_action_status["On Hold"] = res.rows[0].hold_c;
          weekly_action_status.Resolved = res.rows[0].res_c;
        }
      } catch (e) {
        console.error("Weekly action status error", e);
      }
    }


    let action_completion_percent = 0;
    try {
      const res = await pool.query(`
         SELECT 
           COUNT(*)::FLOAT as total,
           SUM(CASE WHEN status IN ('Resolved', 'Approved & Closed', 'Cancelled') THEN 1 ELSE 0 END)::FLOAT as closed
         FROM actions
         WHERE 1=1 ${actionWeeksWhere}
       `, actionWeeksParams);
      const t = res.rows[0].total || 0;
      const c = res.rows[0].closed || 0;
      if (t > 0) action_completion_percent = Math.round((c / t) * 100);
    } catch (e) { }



    const getTrend = async (table) => {
      try {
        const res = await pool.query(`
             SELECT EXTRACT(MONTH FROM updated_at)::INT as m, COUNT(*) as c
             FROM ${table}
             WHERE EXTRACT(YEAR FROM updated_at) = $1
             GROUP BY m
             ORDER BY m ASC
           `, [selectedYear]);


        const counts = [];
        for (let i = 1; i <= 12; i++) {
          const found = res.rows.find(r => r.m === i);
          counts.push({ value: found ? Number(found.c) : 0 });
        }
        return counts;
      } catch { return Array(12).fill({ value: 0 }); }
    };

    const trend_escalations = await getTrend('escalations');


    let trend_closed = [];
    try {


      const res = await pool.query(`
        SELECT EXTRACT(MONTH FROM updated_at)::INT as m, COUNT(*) as c
        FROM (
          SELECT updated_at FROM risks WHERE status IN ('Resolved', 'Approved & Closed', 'Cancelled')
          UNION ALL SELECT updated_at FROM issues WHERE status IN ('Resolved', 'Approved & Closed', 'Cancelled')
          UNION ALL SELECT updated_at FROM actions WHERE status IN ('Resolved', 'Approved & Closed', 'Cancelled')
          UNION ALL SELECT updated_at FROM dependencies WHERE status IN ('Resolved', 'Approved & Closed', 'Cancelled')
          UNION ALL SELECT updated_at FROM escalations WHERE status IN ('Resolved', 'Approved & Closed', 'Cancelled')
        ) as t
        WHERE EXTRACT(YEAR FROM updated_at) = $1
        GROUP BY m
        ORDER BY m ASC
      `, [selectedYear]);

      const counts = [];
      for (let i = 1; i <= 12; i++) {
        const found = res.rows.find(r => r.m === i);
        counts.push({ value: found ? Number(found.c) : 0 });
      }
      trend_closed = counts;

    } catch (e) {
      console.error("Trend closed error", e);
      trend_closed = Array(12).fill({ value: 0 });
    }


    let trend_created = [];
    try {
      const res = await pool.query(`
        SELECT EXTRACT(MONTH FROM created_date)::INT as m, COUNT(*) as c
        FROM (
          SELECT identified_date as created_date FROM risks WHERE identified_date IS NOT NULL
          UNION ALL SELECT reported_date as created_date FROM issues WHERE reported_date IS NOT NULL
          UNION ALL SELECT created_date FROM actions WHERE created_date IS NOT NULL
          UNION ALL SELECT reported_date as created_date FROM dependencies WHERE reported_date IS NOT NULL
          UNION ALL SELECT reported_date as created_date FROM escalations WHERE reported_date IS NOT NULL
        ) as t
        WHERE EXTRACT(YEAR FROM created_date) = $1
        GROUP BY m
        ORDER BY m ASC
      `, [selectedYear]);

      const counts = [];
      for (let i = 1; i <= 12; i++) {
        const found = res.rows.find(r => r.m === i);
        counts.push({ value: found ? Number(found.c) : 0 });
      }
      trend_created = counts;
    } catch (e) {
      console.error("Trend created error", e);
      trend_created = Array(12).fill({ value: 0 });
    }

    return res.json({
      total_open: total_open,
      total_on_hold: total_on_hold,
      resolved: resolved,
      approved: approved,
      cancelled: cancelled,
      total_items,
      priority_split: prioritySplit,
      priority_by_module,
      monthly_risk_trend,
      available_years,
      selected_year: selectedYear,
      trend_closed,
      trend_created,
      trend_escalations,
      action_completion_percent,
      weekly_action_status,
      available_action_weeks,
      selected_action_week: selectedWeek,
      module_status,
      latest_risks,
      latest_issues,
      latest_dependencies,
      latest_issues,
      latest_dependencies,
      latest_actions,
      top_priority_items
    });

  } catch (err) {
    console.error('DASHBOARD METRICS ERROR:', err);
    return res.status(500).json({ error: 'metrics_fetch_failed', message: err.message });
  }
}
