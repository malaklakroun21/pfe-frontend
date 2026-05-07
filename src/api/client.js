import { clearAuthSession, getAccessToken } from "../authSession.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

function buildRequestUrl(path) {
  return `${API_BASE_URL}${path}`;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const isJsonResponse = contentType.includes("application/json");
  const payload = isJsonResponse ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    const errorMessage =
      payload?.error?.message ||
      payload?.message ||
      "Une erreur est survenue pendant la communication avec le serveur.";

    throw new Error(errorMessage);
  }

  return payload?.data ?? null;
}

export async function apiRequest(path, options = {}) {
  const { body, headers, ...fetchOptions } = options;
  const requestHeaders = new Headers(headers || {});
  const accessToken = getAccessToken();

  if (accessToken) {
    requestHeaders.set("Authorization", `Bearer ${accessToken}`);
  }

  let requestBody = body;

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildRequestUrl(path), {
    ...fetchOptions,
    headers: requestHeaders,
    body: requestBody,
  });

  return parseResponse(response);
}

export const authApi = {
  login(payload) {
    return apiRequest("/auth/login", {
      method: "POST",
      body: payload,
    });
  },
  register(payload) {
    return apiRequest("/auth/register", {
      method: "POST",
      body: payload,
    });
  },
};

export const userApi = {
  getCurrentUser() {
    return apiRequest("/users/me");
  },
  getUserById(userId) {
    return apiRequest(`/users/${userId}`);
  },
  getUserRatings(userId) {
    return apiRequest(`/users/${userId}/ratings`);
  },
  getAlgerianCities() {
    return apiRequest("/users/location-options/algeria");
  },
  updateCurrentUser(payload) {
    return apiRequest("/users/me", {
      method: "PUT",
      body: payload,
    });
  },
};

export const dashboardApi = {
  getOverview() {
    return apiRequest("/dashboard/overview");
  },
  getProfile() {
    return apiRequest("/dashboard/profile");
  },
  getExploreDirectory() {
    return apiRequest("/dashboard/explore");
  },
  getValidationData() {
    return apiRequest("/dashboard/validation");
  },
  createValidationRequest(payload) {
    return apiRequest("/dashboard/validation-requests", {
      method: "POST",
      body: payload,
    });
  },
};

export const sessionApi = {
  list() {
    return apiRequest("/sessions");
  },
  listDirectory() {
    return apiRequest("/sessions/explore");
  },
  request(payload) {
    return apiRequest("/sessions/request", {
      method: "POST",
      body: payload,
    });
  },
  cancel(sessionId) {
    return apiRequest(`/sessions/${sessionId}/cancel`, {
      method: "PATCH",
    });
  },
};

export const projectApi = {
  list(params = {}) {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      searchParams.set(key, String(value));
    });

    const query = searchParams.toString();

    return apiRequest(`/projects${query ? `?${query}` : ""}`);
  },
  create(payload) {
    return apiRequest("/projects", {
      method: "POST",
      body: payload,
    });
  },
  get(projectId) {
    return apiRequest(`/projects/${projectId}`);
  },
  update(projectId, payload) {
    return apiRequest(`/projects/${projectId}`, {
      method: "PUT",
      body: payload,
    });
  },
  delete(projectId) {
    return apiRequest(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },
  join(projectId) {
    return apiRequest(`/projects/${projectId}/join`, {
      method: "POST",
    });
  },
  leave(projectId) {
    return apiRequest(`/projects/${projectId}/leave`, {
      method: "POST",
    });
  },
  removeMember(projectId, userId) {
    return apiRequest(`/projects/${projectId}/members/${userId}`, {
      method: "DELETE",
    });
  },
};

export const messageApi = {
  listConversations() {
    return apiRequest("/messages/conversations");
  },
  getConversationWithUser(userId) {
    return apiRequest(`/messages/with/${userId}`);
  },
  sendMessage(payload) {
    return apiRequest("/messages", {
      method: "POST",
      body: payload,
    });
  },
  markMessageAsRead(messageId) {
    return apiRequest(`/messages/${messageId}/read`, {
      method: "PATCH",
    });
  },
};

export const creditApi = {
  getHistory() {
    return apiRequest("/credits/history");
  },
};

export const notificationApi = {
  list() {
    return apiRequest("/notifications");
  },
  markAllAsRead() {
    return apiRequest("/notifications/read-all", {
      method: "PATCH",
    });
  },
  markAsRead(notificationId) {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  },
  delete(notificationId) {
    return apiRequest(`/notifications/${notificationId}`, {
      method: "DELETE",
    });
  },
};
