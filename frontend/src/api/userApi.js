import apiRequest from "./client";

export function getMyProfileApi() {
  return apiRequest("/api/users/me", {
    method: "GET",
  });
}

export function getUsersApi() {
  return apiRequest("/api/users", {
    method: "GET",
  });
}

export function updateMyProfileApi(payload) {
  return apiRequest("/api/users/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function changeMyPasswordApi(payload) {
  return apiRequest("/api/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function updateMyStatusApi(userStatus) {
  return apiRequest("/api/users/me/status", {
    method: "PATCH",
    body: JSON.stringify({ userStatus }),
  });
}

export function getMySettingsApi() {
  return apiRequest("/api/users/me/settings", {
    method: "GET",
  });
}

export function updateMySettingsApi(payload) {
  return apiRequest("/api/users/me/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
