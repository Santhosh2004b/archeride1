// src/api/notificationsApi.js
import { BASE_URL, authHeaders, handleResponse } from "./http";

// LIST pending risk notifications (ADMIN)
export async function fetchRiskNotifications() {
  const res = await fetch(`${BASE_URL}/notifications/risks`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

// Other modules (ADMIN)
export async function fetchIssueNotifications() {
  const res = await fetch(`${BASE_URL}/notifications/issues`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function fetchDependencyNotifications() {
  const res = await fetch(`${BASE_URL}/notifications/dependencies`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function fetchEscalationNotifications() {
  const res = await fetch(`${BASE_URL}/notifications/escalations`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

export async function fetchActionNotifications() {
  const res = await fetch(`${BASE_URL}/notifications/actions`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  return handleResponse(res);
}

// ADMIN decisions
export async function decideRiskNotification(notificationId, decision, comment) {
  const res = await fetch(`${BASE_URL}/risks/decisions/${notificationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ decision, comment }),
  });
  return handleResponse(res);
}

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

export async function decideDependencyNotification(
  notificationId,
  decision,
  comment
) {
  const res = await fetch(
    `${BASE_URL}/dependencies/decisions/${notificationId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ decision, comment }),
    }
  );
  return handleResponse(res);
}

export async function decideEscalationNotification(
  notificationId,
  decision,
  comment
) {
  const res = await fetch(
    `${BASE_URL}/escalations/decisions/${notificationId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ decision, comment }),
    }
  );
  return handleResponse(res);
}

export async function decideActionNotification(
  notificationId,
  decision,
  comment
) {
  const res = await fetch(`${BASE_URL}/actions/decisions/${notificationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ decision, comment }),
  });
  return handleResponse(res);
}

// BM list – supports module filter (?module=)
export async function fetchBmNotifications(module = "risk") {
  const res = await fetch(
    `${BASE_URL}/notifications/bm?module=${encodeURIComponent(module)}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
    }
  );
  return handleResponse(res);
}

// Bell counts
export async function fetchAdminNotificationCount() {
  const res = await fetch(`${BASE_URL}/notifications/counts/admin`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || "Request failed");
  }
  return body.data?.count ?? 0;
}

export async function fetchBmNotificationCount() {
  const res = await fetch(`${BASE_URL}/notifications/counts/bm`, {
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(body.message || "Request failed");
  }
  return body.data?.count ?? 0;
}
