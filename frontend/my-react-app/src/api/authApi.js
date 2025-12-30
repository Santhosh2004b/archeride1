const BASE_URL = "http://localhost:5000/api";

export async function loginApi(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok || !body.success) {
    throw new Error(body.message || "Login failed");
  }

  return body;
}
