// backend/utils/filters.utils.js
// Utilities to build WHERE clause + params for list endpoints.
// Each builder returns { whereSql, params } where params is an array for pg.

function _val(q, a, alt) {
  // helper to read either camelCase or snake_case query params
  if (q && q[a] !== undefined && q[a] !== "") return q[a];
  if (q && q[alt] !== undefined && q[alt] !== "") return q[alt];
  return undefined;
}

function _parseAgingBucket(bucket) {
  // bucket like "0-7", "8-30", "31-999"
  if (!bucket) return null;
  const parts = String(bucket).split("-").map((s) => Number(s));
  if (parts.length !== 2 || parts.some(isNaN)) return null;
  return parts;
}

// Generic: build search ILIKE clause across multiple columns
function _buildSearchClause(cols, paramIndexStart, params, searchVal) {
  if (!searchVal) return { snippet: "", nextIndex: paramIndexStart };
  const idx = paramIndexStart;
  const tokens = [];

  // single param for whole wildcard string
  params.push(`%${searchVal}%`);
  cols.forEach((col) => {
    tokens.push(`${col} ILIKE $${params.length}`); // all point to same last param
  });

  const snippet = tokens.length ? `(${tokens.join(" OR ")})` : "";
  return { snippet, nextIndex: paramIndexStart + 1 };
}

// ------------------ builders ------------------

export function buildRiskFilters(query = {}) {
  const where = [];
  const params = [];
  let i = 1;

  const status = _val(query, "status", "status");
  const priority = _val(query, "priority", "priority");
  const category = _val(query, "category", "category");
  const projectName = _val(query, "project_name", "project_name");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const aging = _val(query, "aging", "aging") || _val(query, "aging_bucket", "aging_bucket");
  const search = _val(query, "search", "search");

  if (status) { where.push(`r.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`r.priority = $${i++}`); params.push(priority); }
  if (category) { where.push(`r.category = $${i++}`); params.push(category); }
  if (projectName) {
    where.push(`r.project_name ILIKE $${i++}`);
    params.push(`%${projectName}%`);
  }
  if (from) { where.push(`r.identified_date >= $${i++}`); params.push(from); }
  if (to) { where.push(`r.identified_date <= $${i++}`); params.push(to); }

  if (aging) {
    const range = _parseAgingBucket(aging);
    if (range) {
      where.push(`(NOW()::date - r.identified_date) BETWEEN $${i++} AND $${i++}`);
      params.push(range[0], range[1]);
    }
  }

  if (search) {
    // search common risk text fields
    params.push(`%${search}%`);
    where.push(`(r.risk_title ILIKE $${i} OR r.risk_description ILIKE $${i} OR r.risk_id ILIKE $${i})`);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

export function buildIssueFilters(query = {}) {
  const where = [];
  const params = [];
  let i = 1;

  const status = _val(query, "status", "status");
  const priority = _val(query, "priority", "priority");
  const projectName = _val(query, "project_name", "project_name");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const aging = _val(query, "aging", "aging") || _val(query, "aging_bucket", "aging_bucket");
  const search = _val(query, "search", "search");

  if (status) { where.push(`i.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`i.priority = $${i++}`); params.push(priority); }
  if (projectName) { where.push(`i.project_name ILIKE $${i++}`); params.push(`%${projectName}%`); }
  if (from) { where.push(`i.reported_date >= $${i++}`); params.push(from); }
  if (to) { where.push(`i.reported_date <= $${i++}`); params.push(to); }

  if (aging) {
    const range = _parseAgingBucket(aging);
    if (range) {
      where.push(`(NOW()::date - i.reported_date) BETWEEN $${i++} AND $${i++}`);
      params.push(range[0], range[1]);
    }
  }

  if (search) {
    params.push(`%${search}%`);
    where.push(`(i.issue_title ILIKE $${i} OR i.issue_description ILIKE $${i} OR i.issue_id ILIKE $${i})`);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

export function buildActionFilters(query = {}) {
  const where = [];
  const params = [];
  let i = 1;

  const status = _val(query, "status", "status");
  const priority = _val(query, "priority", "priority");
  const projectName = _val(query, "project_name", "project_name");

  const related = _val(query, "related_to_type", "related_to_type");
  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");

  if (status) { where.push(`a.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`a.priority = $${i++}`); params.push(priority); }
  if (projectName) { where.push(`a.project_name ILIKE $${i++}`); params.push(`%${projectName}%`); }
  if (related) { where.push(`a.related_to_type = $${i++}`); params.push(related); }
  if (from) { where.push(`a.created_date >= $${i++}`); params.push(from); }
  if (to) { where.push(`a.created_date <= $${i++}`); params.push(to); }

  if (search) {
    params.push(`%${search}%`);
    where.push(`(a.action_title ILIKE $${i} OR a.action_description ILIKE $${i} OR a.action_id ILIKE $${i})`);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

export function buildDependencyFilters(query = {}) {
  const where = [];
  const params = [];
  let i = 1;

  const status = _val(query, "status", "status");
  const priority = _val(query, "priority", "priority");
  const type = _val(query, "type", "type");
  const projectName = _val(query, "project_name", "project_name");

  const dependentOn = _val(query, "dependent_on", "dependent_on");
  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");

  if (status) { where.push(`d.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`d.priority = $${i++}`); params.push(priority); }
  if (type) { where.push(`d.type = $${i++}`); params.push(type); }
  if (projectName) {
    where.push(`d.project_name ILIKE $${i++}`);
    params.push(`%${projectName}%`);
  }
  if (dependentOn) { where.push(`d.dependent_on ILIKE $${i++}`); params.push(`%${dependentOn}%`); }
  if (from) { where.push(`d.reported_date >= $${i++}`); params.push(from); }
  if (to) { where.push(`d.reported_date <= $${i++}`); params.push(to); }

  if (search) {
    params.push(`%${search}%`);
    where.push(`(d.dependency_title ILIKE $${i} OR d.description ILIKE $${i} OR d.dependency_id ILIKE $${i})`);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

export function buildEscalationFilters(query = {}) {
  const where = [];
  const params = [];
  let i = 1;

  const status = _val(query, "status", "status");
  const priority = _val(query, "priority", "priority");
  const category = _val(query, "category", "category");
  const projectName = _val(query, "project_name", "project_name");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");

  if (status) { where.push(`e.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`e.priority = $${i++}`); params.push(priority); }
  if (category) { where.push(`e.category = $${i++}`); params.push(category); }
  if (projectName) {
    where.push(`e.project_name ILIKE $${i++}`);
    params.push(`%${projectName}%`);
  }
  if (from) { where.push(`e.reported_date >= $${i++}`); params.push(from); }
  if (to) { where.push(`e.reported_date <= $${i++}`); params.push(to); }

  if (search) {
    params.push(`%${search}%`);
    where.push(`(e.title ILIKE $${i} OR e.description ILIKE $${i} OR e.escalation_id ILIKE $${i})`);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

// replace existing buildAppreciationFilters in backend/utils/filters.utils.js
export function buildAppreciationFilters(query = {}) {
  const where = [];
  const params = [];
  let i = 1;

  const projectName = _val(query, "project_name", "project_name");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");

  if (projectName) { where.push(`a.project_name ILIKE $${i++}`); params.push(`%${projectName}%`); }
  if (from) { where.push(`a.received_date >= $${i++}`); params.push(from); }
  if (to) { where.push(`a.received_date <= $${i++}`); params.push(to); }

  if (search) {
    params.push(`%${search}%`);
    where.push(`(a.subject ILIKE $${i} OR a.details ILIKE $${i} OR a.customer_name ILIKE $${i})`);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

export function buildCollectionFilters(query = {}) {
  const where = [];
  const params = [];
  let i = 1;

  const status = _val(query, "status", "status");
  const aging = _val(query, "aging", "aging") || _val(query, "aging_bucket", "aging_bucket");
  const projectName = _val(query, "project_name", "project_name");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");

  if (status) { where.push(`c.status = $${i++}`); params.push(status); }
  if (projectName) {
    where.push(`c.project_name ILIKE $${i++}`);
    params.push(`%${projectName}%`);
  }
  if (from) { where.push(`c.invoice_date >= $${i++}`); params.push(from); }
  if (to) { where.push(`c.invoice_date <= $${i++}`); params.push(to); }

  if (aging) {
    const range = _parseAgingBucket(aging);
    if (range) {
      where.push(`(NOW()::date - c.invoice_date) BETWEEN $${i++} AND $${i++}`);
      params.push(range[0], range[1]);
    }
  }

  if (search) {
    params.push(`%${search}%`);
    where.push(`(c.invoice_id ILIKE $${i} OR c.customer_name ILIKE $${i} OR c.remarks ILIKE $${i})`);
    i++;
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}
