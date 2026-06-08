import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

export const vacationApi = {
  getAll: async () => {
    const response = await axios.get(`${API_BASE_URL}/api/vacations`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getByUser: async (userId) => {
    const response = await axios.get(
      `${API_BASE_URL}/api/vacations/user/${userId}`,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  create: async (payload) => {
    const response = await axios.post(
      `${API_BASE_URL}/api/vacations`,
      payload,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  cancel: async (vacationId) => {
    const response = await axios.patch(
      `${API_BASE_URL}/api/vacations/${vacationId}/cancel`,
      {},
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  approve: async (vacationId) => {
    const response = await axios.patch(
      `${API_BASE_URL}/api/vacations/${vacationId}/approve`,
      undefined,
      {
        headers: getAuthHeader(),
      }
    );
    return response.data;
  },

  reject: async (vacationId, rejectReason = "관리자 반려") => {
    const response = await axios.patch(
      `${API_BASE_URL}/api/vacations/${vacationId}/reject`,
      {
        rejectReason,
      },
      {
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },
};