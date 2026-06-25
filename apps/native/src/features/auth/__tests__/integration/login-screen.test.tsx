import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/react-native";
import type { AxiosAdapter, AxiosInstance, AxiosResponse } from "axios";
import type { PropsWithChildren } from "react";
import { Text } from "react-native";

const reanimatedMock = require("../../../../../test/mocks/react-native-reanimated.js");

// Expo Router's helper installs its own Reanimated mock, so register this
// platform shim before lazily loading route modules that import design tokens.
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

const successfulSignInResponse = {
	user: {
		id: "user-123",
		email: "homeowner@example.com",
	},
	session: {
		accessToken: "access-token-123",
		refreshToken: "refresh-token-123",
		expiresAt: 4_102_444_800,
	},
};

function createDeferred<T>() {
	let resolve!: (value: T) => void;
	let reject!: (reason?: unknown) => void;
	const promise = new Promise<T>((promiseResolve, promiseReject) => {
		resolve = promiseResolve;
		reject = promiseReject;
	});

	return { promise, reject, resolve };
}

function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			mutations: { retry: false },
			queries: { retry: false },
		},
	});
}

async function renderLoginRoute() {
	const queryClient = createQueryClient();
	const LoginRoute = require("@/src/app/(auth)/login").default;
	const { renderRouter } = getRouterTestingLibrary();
	const ROUTES = getRoutes();
	function Providers({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	const result = renderRouter(
		{
			"(auth)/login": LoginRoute,
			"(auth)/forgot-password": () => <Text>Forgot password route</Text>,
			"user/index": () => <Text>User home route</Text>,
		},
		{
			initialUrl: ROUTES.auth.login,
			wrapper: Providers,
		},
	);
	// RNTL 14 renders asynchronously; Expo Router decorates that promise with
	// router helpers, so await it before using query APIs.
	const renderResult = await result;

	return { queryClient, router: result, ...renderResult };
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

describe("login auth integration", () => {
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

	it("validates credentials before making a backend sign-in request", async () => {
		const user = userEvent.setup();
		const backend = mockBackendResponse(successfulSignInResponse);
		const view = await renderLoginRoute();

		await user.type(view.getByLabelText("Email"), "not-an-email");
		await user.type(view.getByLabelText("Password"), "secret123");
		await user.press(view.getByRole("button", { name: "Log in" }));

		expect(
			view.getByText("Please enter a valid email address"),
		).toBeOnTheScreen();
		expect(backend).not.toHaveBeenCalled();
		expect(getAuthStore().getState().isAuthenticated).toBe(false);
	});

	it("signs in through the real auth mutation and routes authenticated users home", async () => {
		const user = userEvent.setup();
		const backend = mockBackendResponse(successfulSignInResponse);
		const view = await renderLoginRoute();

		await user.type(view.getByLabelText("Email"), "homeowner@example.com");
		await user.type(view.getByLabelText("Password"), "secure123");
		await user.press(view.getByRole("button", { name: "Log in" }));

		expect(await view.findByText("User home route")).toBeOnTheScreen();
		expect(backend).toHaveBeenCalledWith(
			expect.objectContaining({
				data: JSON.stringify({
					email: "homeowner@example.com",
					password: "secure123",
				}),
				method: "post",
				url: "/api/auth/signin",
			}),
		);
		expect(getAuthStore().getState()).toMatchObject({
			accessToken: "access-token-123",
			isAuthenticated: true,
			refreshToken: "refresh-token-123",
			user: {
				id: "user-123",
				email: "homeowner@example.com",
			},
			userType: "user",
		});
	});

	it("keeps the submit action disabled while the sign-in request is pending", async () => {
		const user = userEvent.setup();
		const pendingResponse = createDeferred<AxiosResponse>();
		getApiClient().defaults.adapter = jest.fn(() => pendingResponse.promise);
		const view = await renderLoginRoute();

		await user.type(view.getByLabelText("Email"), "homeowner@example.com");
		await user.type(view.getByLabelText("Password"), "secure123");
		await user.press(view.getByRole("button", { name: "Log in" }));

		expect(view.getByRole("button", { name: "Log in" })).toBeDisabled();
		pendingResponse.resolve({
			config: {},
			data: successfulSignInResponse,
			headers: {},
			status: 200,
			statusText: "OK",
		} as AxiosResponse);
		expect(await view.findByText("User home route")).toBeOnTheScreen();
	});

	it("navigates to forgot password through the real in-memory router", async () => {
		const user = userEvent.setup();
		mockBackendResponse(successfulSignInResponse);
		const view = await renderLoginRoute();

		await user.press(view.getByRole("button", { name: "Forgot Password?" }));

		expect(await view.findByText("Forgot password route")).toBeOnTheScreen();
	});
});
