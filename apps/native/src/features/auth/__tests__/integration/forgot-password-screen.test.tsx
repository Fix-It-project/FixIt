import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@testing-library/react-native";
import type { AxiosAdapter, AxiosInstance, AxiosResponse } from "axios";
import type { PropsWithChildren } from "react";

const reanimatedMock = require("../../../../../test/mocks/react-native-reanimated.js");

// Expo Router installs its own Reanimated mock; register the platform shim
// before lazily loading the route module (see login-screen.test.tsx).
jest.doMock("react-native-reanimated/mock", () => reanimatedMock);
jest.doMock("react-native-reanimated", () => reanimatedMock);

function getApiClient(): AxiosInstance {
	return require("@/src/config/api-client").default;
}

function getRoutes() {
	return require("@/src/lib/navigation").ROUTES;
}

function getRouterTestingLibrary() {
	return require("expo-router/testing-library");
}

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

async function renderForgotPasswordRoute() {
	const queryClient = createQueryClient();
	const ForgotPasswordRoute = require("@/src/app/(auth)/forgot-password").default;
	const { renderRouter } = getRouterTestingLibrary();
	const ROUTES = getRoutes();

	function Providers({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	const result = renderRouter(
		{ "(auth)/forgot-password": ForgotPasswordRoute },
		{ initialUrl: ROUTES.auth.forgotPassword, wrapper: Providers },
	);
	const renderResult = await result;
	return { queryClient, router: result, ...renderResult };
}

describe("forgot-password integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("validates the email locally before calling the backend", async () => {
		const user = userEvent.setup();
		const backend = mockBackendResponse({ message: "sent" });
		const view = await renderForgotPasswordRoute();

		await user.type(view.getByTestId("forgot-email-input"), "not-an-email");
		await user.press(view.getByTestId("forgot-submit"));

		expect(backend).not.toHaveBeenCalled();
		// Still on the entry form — the "check inbox" confirmation never rendered.
		expect(view.queryByText("Check your inbox")).toBeNull();
	});

	it("sends the reset request and swaps to the check-inbox confirmation", async () => {
		const user = userEvent.setup();
		const backend = mockBackendResponse({ message: "Reset link sent" });
		const view = await renderForgotPasswordRoute();

		await user.type(
			view.getByTestId("forgot-email-input"),
			"homeowner@example.com",
		);
		await user.press(view.getByTestId("forgot-submit"));

		expect(await view.findByText("Check your inbox")).toBeOnTheScreen();
		expect(view.getByText("homeowner@example.com")).toBeOnTheScreen();
		expect(backend).toHaveBeenCalledWith(
			expect.objectContaining({
				method: "post",
				url: "/api/auth/forgot-password",
				data: JSON.stringify({ email: "homeowner@example.com" }),
			}),
		);
	});

	it("keeps submit disabled until an email is entered", async () => {
		mockBackendResponse({ message: "sent" });
		const view = await renderForgotPasswordRoute();

		// Empty email → button inactive.
		expect(view.getByTestId("forgot-submit")).toBeDisabled();
	});
});
