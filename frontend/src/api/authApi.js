import apiRequest from "./client";

export function loginApi(loginData) {
  return apiRequest("/api/users/login", {
    method: "POST",
    body: JSON.stringify(loginData),
  });
}

export function signupApi(signupData) {
  return apiRequest("/api/users/signup", {
    method: "POST",
    body: JSON.stringify(signupData),
  });
}

export function logoutApi() {
  return apiRequest("/api/users/logout", {
    method: "POST",
  });
}