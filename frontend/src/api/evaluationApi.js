import apiRequest from "./client";

export function getEvaluationsApi() {
  return apiRequest("/api/evaluations", {
    method: "GET",
  });
}

export function createEvaluationApi(data) {
  return apiRequest("/api/evaluations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getEvaluationsByUserApi(targetUserId) {
  return apiRequest(`/api/evaluations/user/${targetUserId}`, {
    method: "GET",
  });
}

export function updateEvaluationApi(evaluationId, data) {
  return apiRequest(`/api/evaluations/${evaluationId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteEvaluationApi(evaluationId) {
  return apiRequest(`/api/evaluations/${evaluationId}`, {
    method: "DELETE",
  });
}