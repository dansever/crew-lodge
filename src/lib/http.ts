import axios from "axios";

/**
 * Axios instance for making HTTP requests
 * @description This is used to make HTTP requests to the API
 * @returns Axios instance
 */
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Interceptor for adding the auth token to the request headers
 * @param config - The request config
 * @returns The request config with the auth token
 * @throws An error if the request fails
 */
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Interceptor for handling the response from the API
 * @param response - The response from the API
 * @returns The response from the API
 */
http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    // Handle specific error cases
    if (status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }

    if (status === 403) {
      console.error("Permission denied");
    }

    if (status && status >= 500) {
      console.error("Server error:", error.response?.data);
    }

    // Log for debugging
    console.error("API error:", {
      url: error.config?.url,
      method: error.config?.method,
      status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  },
);

export default http;
