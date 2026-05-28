import axios from "axios";
import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

const API_BASE_URL = env.VITE_SERVER_URL;

const LOGIN_PATH = "/api/admin/auth/login";

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	timeout: 15000,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

apiClient.interceptors.response.use(
	(response) => response,
	(error) => {
		const url: string | undefined = error.config?.url;
		const isLogin = !!url && url.includes(LOGIN_PATH);

		// Session cookie missing or expired: drop the optimistic auth flag so the
		// router guard bounces to /login. Skip the login request itself.
		if (error.response?.status === 401 && !isLogin) {
			useAuthStore.getState().clearSession();
		}

		throw error;
	},
);

export { apiClient, supabase };
export default apiClient;
