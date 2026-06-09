import { supabase } from "@/src/config/supabase";
import { toAppError } from "@/src/lib/errors";
import { logger } from "@/src/lib/logger";
import { useAuthStore } from "@/src/stores/auth-store";
import { env } from "@FixIt/env/native";
import axios, { type InternalAxiosRequestConfig } from "axios";
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
			const { refreshToken, setSession, userType } = useAuthStore.getState();

			if (!refreshToken) {
				throw new Error("No refresh token available");
			}

			logger.info("apiClient", "Refreshing access token");

			const refreshUrl =
				userType === "technician"
					? `${API_BASE_URL}/api/technician-auth/refresh`
					: `${API_BASE_URL}/api/auth/refresh`;

			const { data } = await axios.post(refreshUrl, {
				refreshToken,
			});

			// Technician endpoints return `technician` instead of `user`
			const user = data.user || data.technician;
			const newAccessToken = data.session.accessToken;
			const newRefreshToken = data.session.refreshToken;

			await setSession(
				user,
				newAccessToken,
				newRefreshToken,
				useAuthStore.getState().userType ?? "user",
			);

			logger.info("apiClient", "Token refreshed successfully", {
				userId: user?.id,
			});
			return newAccessToken;
		} catch (error) {
			logger.error("apiClient", "Token refresh failed", error);
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
			config.url?.includes("/api/auth/refresh") ||
			config.url?.includes("/api/auth/forgot-password") ||
			config.url?.includes("/api/auth/reset-password") ||
			config.url?.includes("/api/technician-auth/signin") ||
			config.url?.includes("/api/technician-auth/signup") ||
			config.url?.includes("/api/technician-auth/check-email") ||
			config.url?.includes("/api/technician-auth/refresh")
		) {
			return config;
		}

		const { data: sessionData } = await supabase.auth.getSession();
		let accessToken: string | null =
			sessionData.session?.access_token ?? useAuthStore.getState().accessToken;

		if (accessToken && isTokenExpired(accessToken, 60)) {
			logger.debug("apiClient", "Access token expired/expiring, refreshing");
			try {
				accessToken = await refreshAccessToken();
			} catch (error) {
				logger.error("apiClient", "Proactive refresh failed", error);
				return config;
			}
		}

		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}

		return config;
	},
	(error) => {
		throw error;
	},
);

// ─── Response Interceptor: Handle 401 Fallback ───────────────────────────────

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config as CustomAxiosRequestConfig;

		if (error.response?.status === 400 || error.response?.status === 422) {
			const responseData =
				error.response.data &&
				typeof error.response.data === "object" &&
				!Array.isArray(error.response.data)
					? (error.response.data as Record<string, unknown>)
					: undefined;
			logger.warn("apiClient", "Validation response", {
				url: originalRequest?.url,
				method: originalRequest?.method,
				status: error.response.status,
				machineCode:
					typeof responseData?.token === "string"
						? responseData.token
						: undefined,
				data: error.response.data,
			});
		}

		if (
			error.response?.status !== 401 ||
			originalRequest._retry ||
			originalRequest.url?.includes("/api/auth/refresh") ||
			originalRequest.url?.includes("/api/auth/signin") ||
			originalRequest.url?.includes("/api/technician-auth/signin") ||
			originalRequest.url?.includes("/api/technician-auth/refresh")
		) {
			throw toAppError(error);
		}

		originalRequest._retry = true;

		try {
			logger.debug("apiClient", "401 received, attempting refresh");
			const newAccessToken = await refreshAccessToken();

			originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
			return apiClient(originalRequest);
		} catch (refreshError) {
			logger.error("apiClient", "Refresh failed, clearing session", refreshError);
			throw toAppError(refreshError);
		}
	},
);

export default apiClient;