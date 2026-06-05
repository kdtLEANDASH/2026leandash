import apiRequest from "./client";

export function getDepartmentsApi() {
  return apiRequest("/api/departments", {
    method: "GET",
  });
}

export function getDepartmentUsersApi(departmentId) {
  return apiRequest(`/api/departments/${departmentId}/users`, {
    method: "GET",
  });
}