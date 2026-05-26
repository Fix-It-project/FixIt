import axios, { type InternalAxiosRequestConfig } from "axios";
import { jwtDecode } from "jwt-decode";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = env.VITE_SERVER_URL;

const PUBLIC_PATHS = [
	"/api/admin/auth/signin",
	"/api/admin/auth/refresh",
];

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

const isPublicPath = (url: string | undefined): boolean => {
	if (!url) return false;
	return PUBLIC_PATHS.some((path) => url.includes(path));
};

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
	if (refreshPromise) {
		return refreshPromise;
	}

	refreshPromise = (async () => {
		try {
			const { refreshToken, setSession, user } = useAuthStore.getState();

			if (!refreshToken || !user) {
				throw new Error("No refresh token / user available");
			}

			const { data } = await axios.post(
				`${API_BASE_URL}/api/admin/auth/refresh`,
				{ refreshToken },
			);

			const newAccessToken = data.session.accessToken;
			const newRefreshToken = data.session.refreshToken;
			const nextUser = data.user ?? user;

			setSession(nextUser, newAccessToken, newRefreshToken);
			return newAccessToken;
		} catch (error) {
			useAuthStore.getState().clearSession();
			throw error;
		} finally {
			refreshPromise = null;
		}
	})();

	return refreshPromise;
};

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
	headers: {
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.request.use(
	async (config: CustomAxiosRequestConfig) => {
		if (isPublicPath(config.url)) {
			return config;
		}

		let accessToken = useAuthStore.getState().accessToken;

		if (accessToken && isTokenExpired(accessToken, 60)) {
			try {
				accessToken = await refreshAccessToken();
			} catch {
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

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config as CustomAxiosRequestConfig;

		if (
			error.response?.status !== 401 ||
			originalRequest._retry ||
			isPublicPath(originalRequest.url)
		) {
			throw error;
		}

		originalRequest._retry = true;

		const newAccessToken = await refreshAccessToken();
		originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
		return apiClient(originalRequest);
	},
);

export { apiClient, supabase };
export default apiClient;
