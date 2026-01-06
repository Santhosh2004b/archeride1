// src/api/issuesApi.js
import { BASE_URL, authHeaders, handleResponse } from "./http";

/**
 * Normalize status values so UI stays consistent.
 */
function sanitizeStatus(payload = {}) {
  if (!payload.status) return payload;

  const s = String(payload.status).toLowerCase();

  if (s === "completed" || s === "closed") {
    return { ...payload, status: "Resolved" };
  }

  return payload;
}

/**
 * Fetch all issues with optional query params
 */
export async function fetchIssues(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/issues${search ? `?${search}` : ""}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });

  return handleResponse(res);
}

export async function fetchIssueApi(id) {
  const res = await fetch(`${BASE_URL}/issues/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

/**
 * Create a new issue
 */
export async function createIssueApi(payload) {
  const res = await fetch(`${BASE_URL}/issues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(sanitizeStatus(payload)),
  });

  return handleResponse(res);
}

/**
 * Update an issue by ID
 */
export async function updateIssueApi(id, payload) {
  const res = await fetch(`${BASE_URL}/issues/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(sanitizeStatus(payload)),
  });

  return handleResponse(res);
}

/**
 * Admin decision workflow for issue notifications
 */
export async function decideIssueNotification(notificationId, decision, comment) {
  const res = await fetch(`${BASE_URL}/issues/decisions/${notificationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ decision, comment }),
  });

  return handleResponse(res);
}
