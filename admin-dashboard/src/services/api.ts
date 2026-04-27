import axios from "axios";

const unwrap = <T>(payload: T | { data: T }): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  login: (payload: { email: string; password: string }) => api.post("/auth/login", payload).then((res) => res.data),
  stats: () => api.get("/reports/platform").then((res) => res.data),
  institutionStats: () => api.get("/reports/institution").then((res) => res.data),
  quizStats: () => api.get("/reports/quizzes").then((res) => res.data),
  performance: () => api.get("/reports/performance").then((res) => res.data),
  teacherReport: () => api.get("/reports/teacher").then((res) => res.data),
  studentAnalytics: (userId?: string) => api.get("/reports/student-analytics", { params: { userId } }).then((res) => res.data),
  institutions: <T = unknown[]>() => api.get("/institutions").then((res) => unwrap<T>(res.data)),
  users: <T = unknown[]>(params?: Record<string, string>) => api.get("/users", { params }).then((res) => unwrap<T>(res.data)),
  quizzes: <T = unknown[]>() => api.get("/quizzes").then((res) => unwrap<T>(res.data)),
  questions: <T = unknown[]>() => api.get("/questions").then((res) => unwrap<T>(res.data)),
  clinicalCases: <T = unknown[]>() => api.get("/clinical-cases").then((res) => unwrap<T>(res.data)),
  categories: () => api.get("/categories").then((res) => res.data),
  plans: () => api.get("/subscriptions/plans").then((res) => res.data),
  payments: <T = unknown[]>() => api.get("/payments").then((res) => unwrap<T>(res.data)),
  leaderboard: (period = "GLOBAL") => api.get("/leaderboard", { params: { period } }).then((res) => res.data),
  notifications: () => api.get("/notifications").then((res) => res.data),
  create: (path: string, payload: unknown) => api.post(path, payload).then((res) => res.data),
  update: (path: string, id: string, payload: unknown) => api.patch(`${path}/${id}`, payload).then((res) => res.data),
  remove: (path: string, id: string) => api.delete(`${path}/${id}`).then((res) => res.data),
  postAction: (path: string) => api.post(path).then((res) => res.data),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/uploads/image", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((res) => res.data as { url: string });
  },
  checkout: (payload: { planId: string; institutionId?: string | null }) => api.post("/payments/checkout", payload).then((res) => res.data)
};
