import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const BASE_URL = "https://skillbridge-backend-78ix.onrender.com";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatic Bearer Token Interceptor
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("user_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Failed to retrieve auth token", e);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor for Unauthorized Handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await AsyncStorage.removeItem("user_token");
    }
    return Promise.reject(error);
  },
);

export default api;
