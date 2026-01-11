// src/api/metricsApi.js
import { BASE_URL, authHeaders, handleResponse } from "./http";

export async function fetchDashboardMetrics(params = {}) {
  const query = new URLSearchParams();
  if (params.year) {
    query.append('year', params.year);
  }
  if (params.week_start) {
    query.append('week_start', params.week_start);
  }
  if (params.priority) {
    query.append('priority', params.priority);
  }
  const queryString = query.toString();
  const url = queryString ? `${BASE_URL}/dashboard/metrics?${queryString}` : `${BASE_URL}/dashboard/metrics`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function fetchPrioritySplit(moduleName) {
  const res = await fetch(`${BASE_URL}/metrics/priority-split?module=${moduleName}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}
