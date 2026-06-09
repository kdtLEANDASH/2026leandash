const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAuthHeaders() {
  const token =
    localStorage.getItem("accessToken") || localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API 요청 실패: ${response.status}`);
  }

  return response.json();
}

export function getDocumentsApi({ keyword = "", department = "" } = {}) {
  const params = new URLSearchParams();

  if (keyword.trim()) params.set("keyword", keyword.trim());
  if (department && department !== "전체") params.set("department", department);

  const query = params.toString();

  return requestJson(`/api/documents${query ? `?${query}` : ""}`, {
    method: "GET",
  });
}

export function getDocumentApi(documentId) {
  return requestJson(`/api/documents/${documentId}`, {
    method: "GET",
  });
}

export function uploadDocumentApi({
  uploaderId,
  title,
  description,
  department,
  file,
}) {
  const formData = new FormData();

  formData.append("uploaderId", uploaderId);
  formData.append("title", title);
  formData.append("description", description || "");
  formData.append("department", department);
  formData.append("file", file);

  return requestJson("/api/documents", {
    method: "POST",
    body: formData,
  });
}

export async function downloadDocumentApi(documentId, fileName = "document") {
  const response = await fetch(
    `${API_BASE_URL}/api/documents/${documentId}/download`,
    {
      method: "GET",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "문서 다운로드 실패");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
}

export function deleteDocumentApi(documentId) {
  return requestJson(`/api/documents/${documentId}`, {
    method: "DELETE",
  });
}