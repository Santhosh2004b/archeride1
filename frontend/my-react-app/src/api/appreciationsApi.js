// src/api/appreciationsApi.js
import { BASE_URL, authHeaders, handleResponse } from "./http";

export async function fetchAppreciations(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/appreciations${search ? `?${search}` : ""}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function fetchAppreciationApi(id) {
  const res = await fetch(`${BASE_URL}/appreciations/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function createAppreciationApi(payload) {
  const res = await fetch(`${BASE_URL}/appreciations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateAppreciationApi(id, payload) {
  const res = await fetch(`${BASE_URL}/appreciations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
