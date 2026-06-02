import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const scheduleApi = {
  getMonthlySchedules: async () => {
    const response = await api.get("/calendar-schedules");
    return response.data;
  },

  createSchedule: async (scheduleData) => {
    const response = await api.post("/calendar-schedules", scheduleData);
    return response.data;
  },

  deleteSchedule: async (scheduleId) => {
    const response = await api.delete(`/calendar-schedules/${scheduleId}`);
    return response.data;
  },
};