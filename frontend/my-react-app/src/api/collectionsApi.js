// src/api/collectionsApi.js
import { BASE_URL, authHeaders, handleResponse } from "./http";

export async function fetchCollections(params = {}) {
  const search = new URLSearchParams(params).toString();
  const url = `${BASE_URL}/collections${search ? `?${search}` : ""}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function createCollectionApi(payload) {
  const res = await fetch(`${BASE_URL}/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateCollectionApi(id, payload) {
  const res = await fetch(`${BASE_URL}/collections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
