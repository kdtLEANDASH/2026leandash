import apiRequest from "./client";

export function getNoticesApi(keyword = "") {
  const query = keyword?.trim()
    ? `?keyword=${encodeURIComponent(keyword.trim())}`
    : "";

  return apiRequest(`/api/notices${query}`, {
    method: "GET",
  });
}

export function getNoticeApi(noticeId) {
  return apiRequest(`/api/notices/${noticeId}`, {
    method: "GET",
  });
}

export function createNoticeApi(payload) {
  return apiRequest("/api/notices", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
