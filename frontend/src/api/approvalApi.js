import apiRequest from "./client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function getMyApprovalsApi() {
  return apiRequest("/api/approvals/me", {
    method: "GET",
  });
}

export function createApprovalApi(payload) {
  return apiRequest("/api/approvals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getApprovalApi(approvalId) {
  return apiRequest(`/api/approvals/${approvalId}`, {
    method: "GET",
  });
}

export function getDepartmentApprovalsApi() {
  return apiRequest("/api/approvals/department", {
    method: "GET",
  });
}

export function getDepartmentApprovalApi(approvalId) {
  return apiRequest(`/api/approvals/department/${approvalId}`, {
    method: "GET",
  });
}

export function uploadApprovalFileApi(approvalId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(`/api/approvals/${approvalId}/files`, {
    method: "POST",
    body: formData,
  });
}

export function approveApprovalApi(approvalId, payload = {}) {
  return apiRequest(`/api/approvals/${approvalId}/approve`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function rejectApprovalApi(approvalId, payload) {
  return apiRequest(`/api/approvals/${approvalId}/reject`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function downloadApprovalAttachmentApi(downloadUrl, fileName) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_BASE_URL}${downloadUrl}`, {
    method: "GET",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "첨부파일 다운로드에 실패했습니다.");
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName || "attachment";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}
