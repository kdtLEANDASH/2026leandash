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
