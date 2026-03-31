import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// User
export const userAPI = {
  updatePreferences: (preferences: string[]) =>
    api.put("/user/preferences", { preferences }),
  toggleSave: (articleId: string) =>
    api.post(`/user/save/${articleId}`),
  getSaved: () => api.get("/user/saved"),
};

// Feed
export const feedAPI = {
  getFeed: (params: { page: number; limit: number; category?: string }) =>
    api.get("/feed", { params }),
};

// Ads tracking
export const adAPI = {
  trackView: (adId: string) => api.post("/ads/view", { adId }),
  trackClick: (adId: string) => api.post("/ads/click", { adId }),
};

// Admin - Agents
export const agentAdminAPI = {
  getAll: () => api.get("/agents"),
  create: (data: any) => api.post("/agents", data),
  update: (id: string, data: any) => api.put(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
};

// Admin - Ads
export const adAdminAPI = {
  getAll: () => api.get("/ads"),
  create: (data: any) => api.post("/ads", data),
  update: (id: string, data: any) => api.put(`/ads/${id}`, data),
  delete: (id: string) => api.delete(`/ads/${id}`),
  getStats: () => api.get("/ads/stats"),
};
