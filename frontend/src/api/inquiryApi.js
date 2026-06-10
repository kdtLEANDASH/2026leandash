import apiRequest from "./client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function getMyInquiriesApi() {
  return apiRequest("/api/inquiries/me", {
    method: "GET",
  });
}

export function getInquiryApi(inquiryId) {
  return apiRequest(`/api/inquiries/${inquiryId}`, {
    method: "GET",
  });
}

export function createInquiryApi(payload) {
  return apiRequest("/api/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getDepartmentInquiriesApi() {
  return apiRequest("/api/inquiries/department", {
    method: "GET",
  });
}

export function getDepartmentInquiryApi(inquiryId) {
  return apiRequest(`/api/inquiries/department/${inquiryId}`, {
    method: "GET",
  });
}

export function answerInquiryApi(inquiryId, payload) {
  return apiRequest(`/api/inquiries/${inquiryId}/answer`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadInquiryFileApi(inquiryId, file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiRequest(`/api/inquiries/${inquiryId}/files`, {
    method: "POST",
    body: formData,
  });
}

export async function downloadInquiryAttachmentApi(downloadUrl, fileName) {
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
