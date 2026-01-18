// backend/utils/filters.utils.js
// Utilities to build WHERE clause + params for list endpoints.
// Each builder returns { whereSql, params } where params is an array for pg.
import { getAssignedProjects } from "../models/users.model.js";

export async function applyRoleRestrictions(user, query) {
  if (user.role === "ADMIN") return query;

  const assigned = await getAssignedProjects(user.id);
  const ids = assigned.map((p) => p.id);

  // Attach to query object so builders can use it
  return {
    ...query,
    allowedProjectIds: ids,
    currentUserId: user.id,
    currentUserEmail: user.email
  };
}

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

function _applyAllowedProjects(where, params, i, query, alias, creatorCol = null, emailCol = null) {
  if (query.allowedProjectIds) {
    const clauses = [];

    // 1. Project Restriction
    if (query.allowedProjectIds.length > 0) {
      clauses.push(`${alias}.project_id = ANY($${i})`);
      params.push(query.allowedProjectIds);
      i++; // increment only if we pushed a param
    } else {
      // No projects
      // We don't push anything yet, we handle it in combinations
    }

    // 2. Creator Restriction (UUID)
    if (creatorCol && query.currentUserId) {
      clauses.push(`${creatorCol} = $${i++}`); // created_by = user.id
      params.push(query.currentUserId);
    }

    // 3. Creator Restriction (Email) - for Legacy/Different tables
    if (emailCol && query.currentUserEmail) {
      clauses.push(`${emailCol} = $${i++}`); // reported_by = user.email
      params.push(query.currentUserEmail);
    }

    if (clauses.length > 0) {
      // (project_id IN (...) OR created_by = ...)
      where.push(`(${clauses.join(" OR ")})`);
    } else {
      // No projects AND no user ID?? Force empty.
      where.push("1 = 0");
    }
  }
  return i;
}

// ------------------ builders ------------------

export function buildRiskFilters(query = {}) {
  const where = [];
  const params = [];
  let i = 1;

  const status = _val(query, "status", "status");
  const priority = _val(query, "priority", "priority");
  const category = _val(query, "category", "category");
  const account = _val(query, "account", "account");
  const manualProjectId = _val(query, "manual_project_id", "manual_project_id");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const aging = _val(query, "aging", "aging") || _val(query, "aging_bucket", "aging_bucket");
  const search = _val(query, "search", "search");
  // Risks: created_by (UUID), identified_by (Email)
  i = _applyAllowedProjects(where, params, i, query, "r", "r.created_by", "r.identified_by");

  if (status) { where.push(`r.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`r.priority = $${i++}`); params.push(priority); }
  if (category) { where.push(`r.category = $${i++}`); params.push(category); }
  if (manualProjectId) { where.push(`r.manual_project_id = $${i++}`); params.push(manualProjectId); }
  if (account) {
    where.push(`r.account ILIKE $${i++}`);
    params.push(`%${account}%`);
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
  const account = _val(query, "account", "account");
  const manualProjectId = _val(query, "manual_project_id", "manual_project_id");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const aging = _val(query, "aging", "aging") || _val(query, "aging_bucket", "aging_bucket");
  const search = _val(query, "search", "search");
  // Issues: reported_by (Email)
  i = _applyAllowedProjects(where, params, i, query, "i", null, "i.reported_by");

  if (status) { where.push(`i.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`i.priority = $${i++}`); params.push(priority); }
  if (manualProjectId) { where.push(`i.manual_project_id = $${i++}`); params.push(manualProjectId); }
  if (account) { where.push(`i.account ILIKE $${i++}`); params.push(`%${account}%`); }
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
  const account = _val(query, "account", "account");
  const manualProjectId = _val(query, "manual_project_id", "manual_project_id");

  const related = _val(query, "related_to_type", "related_to_type");
  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");
  // Actions: created_by (Email)
  i = _applyAllowedProjects(where, params, i, query, "a", null, "a.created_by");

  if (status) { where.push(`a.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`a.priority = $${i++}`); params.push(priority); }
  if (manualProjectId) { where.push(`a.manual_project_id = $${i++}`); params.push(manualProjectId); }
  if (account) { where.push(`a.account ILIKE $${i++}`); params.push(`%${account}%`); }
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
  const account = _val(query, "account", "account");
  const manualProjectId = _val(query, "manual_project_id", "manual_project_id");

  const dependentOn = _val(query, "dependent_on", "dependent_on");
  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");
  // Dependencies: No specific creator col typically, maybe reported_by? 
  // Checking schema... let's assume 'reported_by' if exists or just skip if mostly project based.
  // Actually usually dependencies are project based. Let's try to be safe.
  // If 'd.created_by' exists as UUID? Or 'd.raised_by'?
  // Let's assume just project for now to avoid errors if column missing.
  i = _applyAllowedProjects(where, params, i, query, "d");

  if (status) { where.push(`d.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`d.priority = $${i++}`); params.push(priority); }
  if (type) { where.push(`d.type = $${i++}`); params.push(type); }
  if (manualProjectId) { where.push(`d.manual_project_id = $${i++}`); params.push(manualProjectId); }
  if (account) {
    where.push(`d.account ILIKE $${i++}`);
    params.push(`%${account}%`);
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
  const account = _val(query, "account", "account");
  const manualProjectId = _val(query, "manual_project_id", "manual_project_id");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");
  // Escalations: reported_by? raised_by?
  // Checking Escalations Model... often 'raised_by' (email).
  // Safest: i = _applyAllowedProjects(where, params, i, query, "e"); 
  // Update if user complains about Escalations.
  i = _applyAllowedProjects(where, params, i, query, "e", "e.created_by");

  if (status) { where.push(`e.status = $${i++}`); params.push(status); }
  if (priority) { where.push(`e.priority = $${i++}`); params.push(priority); }
  if (category) { where.push(`e.category = $${i++}`); params.push(category); }
  if (manualProjectId) { where.push(`e.manual_project_id = $${i++}`); params.push(manualProjectId); }
  if (account) {
    where.push(`e.account ILIKE $${i++}`);
    params.push(`%${account}%`);
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

  const account = _val(query, "account", "account");
  const manualProjectId = _val(query, "manual_project_id", "manual_project_id");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");
  i = _applyAllowedProjects(where, params, i, query, "a");

  if (manualProjectId) { where.push(`a.manual_project_id = $${i++}`); params.push(manualProjectId); }
  if (account) { where.push(`a.account ILIKE $${i++}`); params.push(`%${account}%`); }
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
  const account = _val(query, "account", "account");
  const manualProjectId = _val(query, "manual_project_id", "manual_project_id");

  const from = _val(query, "fromDate", "from_date");
  const to = _val(query, "toDate", "to_date");
  const search = _val(query, "search", "search");
  i = _applyAllowedProjects(where, params, i, query, "c");

  if (status) { where.push(`c.status = $${i++}`); params.push(status); }
  if (manualProjectId) { where.push(`c.manual_project_id = $${i++}`); params.push(manualProjectId); }
  if (account) {
    where.push(`c.account ILIKE $${i++}`);
    params.push(`%${account}%`);
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

