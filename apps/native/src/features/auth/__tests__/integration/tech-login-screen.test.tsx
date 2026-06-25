import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/react-native";
import type { AxiosAdapter, AxiosInstance, AxiosResponse } from "axios";
import type { PropsWithChildren } from "react";
import { Text } from "react-native";

const reanimatedMock = require("../../../../../test/mocks/react-native-reanimated.js");

jest.doMock("react-native-reanimated/mock", () => reanimatedMock);
jest.doMock("react-native-reanimated", () => reanimatedMock);

function getApiClient(): AxiosInstance {
	return require("@/src/config/api-client").default;
}

function getAuthStore() {
	return require("@/src/stores/auth-store").useAuthStore;
}

function getRoutes() {
	return require("@/src/lib/navigation").ROUTES;
}

function getRouterTestingLibrary() {
	return require("expo-router/testing-library");
}

const technicianSignInResponse = {
	technician: { id: "tech-9", email: "tech@example.com" },
	session: {
		accessToken: "tech-access",
		refreshToken: "tech-refresh",
		expiresAt: 4_102_444_800,
	},
};

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			mutations: { retry: false },
			queries: { retry: false },
		},
	});
}

function mockBackendResponse(data: unknown): jest.MockedFunction<AxiosAdapter> {
	const adapter = jest.fn(async (config) => {
		const response: AxiosResponse = {
			config,
			data,
			headers: {},
			status: 200,
			statusText: "OK",
		};
		return response;
	});
	getApiClient().defaults.adapter = adapter;
	return adapter;
}

async function renderTechLoginRoute() {
	const queryClient = createQueryClient();
	const TechLoginRoute = require("@/src/app/(auth)/tech-login").default;
	const { renderRouter } = getRouterTestingLibrary();
	const ROUTES = getRoutes();

	function Providers({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	const result = renderRouter(
		{
			"(auth)/tech-login": TechLoginRoute,
			"(auth)/forgot-password": () => <Text>Forgot password route</Text>,
			"technician/index": () => <Text>Technician home route</Text>,
		},
		{ initialUrl: ROUTES.auth.techLogin, wrapper: Providers },
	);
	const renderResult = await result;
	return { queryClient, router: result, ...renderResult };
}

describe("technician login integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		getAuthStore().setState({
			accessToken: null,
			isAuthenticated: false,
			isLoading: false,
			refreshToken: null,
			user: null,
			userType: null,
		});
	});

	it("validates credentials before hitting the technician sign-in endpoint", async () => {
		const user = userEvent.setup();
		const backend = mockBackendResponse(technicianSignInResponse);
		const view = await renderTechLoginRoute();

		await user.type(view.getByTestId("login-email-input"), "bad-email");
		await user.type(view.getByTestId("login-password-input"), "secret123");
		await user.press(view.getByTestId("login-submit"));

		expect(backend).not.toHaveBeenCalled();
		expect(getAuthStore().getState().isAuthenticated).toBe(false);
	});

	it("signs in a technician and routes to the technician home", async () => {
		const user = userEvent.setup();
		const backend = mockBackendResponse(technicianSignInResponse);
		const view = await renderTechLoginRoute();

		await user.type(view.getByTestId("login-email-input"), "tech@example.com");
		await user.type(view.getByTestId("login-password-input"), "secret123");
		await user.press(view.getByTestId("login-submit"));

		expect(await view.findByText("Technician home route")).toBeOnTheScreen();
		expect(backend).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "post",
				url: "/api/technician-auth/signin",
				data: JSON.stringify({
					email: "tech@example.com",
					password: "secret123",
				}),
			}),
		);
		expect(getAuthStore().getState()).toMatchObject({
			isAuthenticated: true,
			userType: "technician",
			user: { id: "tech-9", email: "tech@example.com" },
		});
	});

	it("navigates to forgot password from the technician login screen", async () => {
		const user = userEvent.setup();
		mockBackendResponse(technicianSignInResponse);
		const view = await renderTechLoginRoute();

		await user.press(view.getByText("Forgot Password?"));

		expect(await view.findByText("Forgot password route")).toBeOnTheScreen();
	});
});
