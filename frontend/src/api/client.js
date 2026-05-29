const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("accessToken");

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),

    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "API 요청 실패");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export default apiRequest;