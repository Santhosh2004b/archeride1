// frontend/my-react-app/src/api/http.js
const BASE_URL = "http://localhost:5000/api";

export function authHeaders() {
  const stored = localStorage.getItem("archeride_auth");
  if (!stored) return {};
  try {
    const parsed = JSON.parse(stored);
    const token = parsed.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function handleResponse(res) {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || "Request failed");
  }
  return body.data !== undefined ? body.data : body;
}

export { BASE_URL };
