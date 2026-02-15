import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		mutations: {
			retry: false,
		},
		queries: {
			retry: 2,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	},
});

export default queryClient;
