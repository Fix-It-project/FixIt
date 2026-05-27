import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			retry: false,
		},
		queries: {
			retry: 2,
			staleTime: 30 * 1000,
			refetchOnMount: true,
			refetchOnReconnect: true,
			refetchOnWindowFocus: true,
		},
	},
});
