import apiRequest from "./client";

export function getDepartmentsApi() {
  return apiRequest("/api/departments", {
    method: "GET",
  });
}