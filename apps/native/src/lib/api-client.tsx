import axios, { InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "@/src/stores/auth-store";
import { env } from "@FixIt/env/native";
import { jwtDecode } from "jwt-decode";

const API_BASE_URL = env.EXPO_PUBLIC_SERVER_URL;

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const isTokenExpired = (token: string, bufferSeconds = 60): boolean => {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime + bufferSeconds;
  } catch {
    return true;
  }
};

// ─── Helper: Refresh Token ───────────────────────────────────────────────────

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { refreshToken, setSession } = useAuthStore.getState();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      console.log("[apiClient] Refreshing access token...");

      const { data } = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken,
      });

      const newAccessToken = data.session.accessToken;
      const newRefreshToken = data.session.refreshToken;

      await setSession(data.user, newAccessToken, newRefreshToken);

      console.log("[apiClient] Token refreshed successfully");
      return newAccessToken;
    } catch (error) {
      console.error("[apiClient] Token refresh failed:", error);
      await useAuthStore.getState().clearSession();
      throw error;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// ─── Axios Instance ──────────────────────────────────────────────────────────

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Proactive Token Check & Refresh ────────────────────

apiClient.interceptors.request.use(
  async (config: CustomAxiosRequestConfig) => {
    if (
      config.url?.includes("/api/auth/signin") ||
      config.url?.includes("/api/auth/signup") ||
      config.url?.includes("/api/auth/refresh")
    ) {
      return config;
    }

    let { accessToken } = useAuthStore.getState();

    if (accessToken && isTokenExpired(accessToken, 60)) {
      console.log("[apiClient] Access token expired/expiring, refreshing...");
      try {
        accessToken = await refreshAccessToken();
      } catch (error) {
        console.error("[apiClient] Proactive refresh failed:", error);
        return config;
      }
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle 401 Fallback ───────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/api/auth/refresh") ||
      originalRequest.url?.includes("/api/auth/signin")
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      console.log("[apiClient] 401 received, attempting refresh...");
      const newAccessToken = await refreshAccessToken();

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      console.error("[apiClient] Refresh failed, clearing session");
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
