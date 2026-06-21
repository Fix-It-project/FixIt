import { userEvent } from "@testing-library/react-native";
import type { PropsWithChildren } from "react";
import { Text } from "react-native";

const reanimatedMock = require("../../../../../test/mocks/react-native-reanimated.js");

jest.doMock("react-native-reanimated/mock", () => reanimatedMock);
jest.doMock("react-native-reanimated", () => reanimatedMock);

// Password reset goes through Supabase (set session → update password → sign
// out), not the axios backend. Swap the whole client for jest fns so the real
// mutation runs end-to-end against a controllable boundary.
const supabaseAuth = {
	setSession: jest.fn(async () => ({ data: {}, error: null })),
	updateUser: jest.fn(async () => ({ data: {}, error: null })),
	signOut: jest.fn(async () => ({ error: null })),
};

function getReactQuery() {
	return require("@tanstack/react-query");
}

function getRecoverySessionUtils() {
	return require("@/src/features/auth/utils/recovery-session");
}

function getRoutes() {
	return require("@/src/lib/navigation").ROUTES;
}

function getRouterTestingLibrary() {
	return require("expo-router/testing-library");
}

function createQueryClient() {
	const { QueryClient } = getReactQuery();
	return new QueryClient({
		defaultOptions: {
			mutations: { retry: false },
			queries: { retry: false },
		},
	});
}

async function renderResetPasswordRoute() {
	jest.doMock("@/src/config/supabase", () => ({ supabase: { auth: supabaseAuth } }));
	// Keep the real module (expo-router relies on Linking.addEventListener); only
	// neutralise the recovery-URL getters so no real deep link leaks in.
	jest.doMock("expo-linking", () => ({
		...jest.requireActual("expo-linking"),
		getLinkingURL: () => null,
		getInitialURL: async () => null,
	}));

	const { QueryClientProvider } = getReactQuery();
	const queryClient = createQueryClient();
	const ResetPasswordRoute = require("@/src/app/(auth)/reset-password").default;
	const { renderRouter } = getRouterTestingLibrary();
	const ROUTES = getRoutes();

	function Providers({ children }: PropsWithChildren) {
		return (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
	}

	const result = renderRouter(
		{
			"(auth)/reset-password": ResetPasswordRoute,
			"(auth)/login": () => <Text>Login route</Text>,
		},
		{ initialUrl: ROUTES.auth.resetPassword, wrapper: Providers },
	);
	const renderResult = await result;
	return { queryClient, router: result, ...renderResult };
}

describe("reset-password integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		getRecoverySessionUtils().clearRecoverySession();
	});

	it("shows the invalid-link state when no recovery session is present", async () => {
		const view = await renderResetPasswordRoute();

		expect(await view.findByText("Invalid Link")).toBeOnTheScreen();
		expect(view.queryByPlaceholderText("New password")).toBeNull();
	});

	it("updates the password through Supabase and returns the user to login", async () => {
		const user = userEvent.setup();
		getRecoverySessionUtils().setRecoverySession({
			accessToken: "recovery-access",
			refreshToken: "recovery-refresh",
			userType: "user",
		});

		const view = await renderResetPasswordRoute();

		await user.type(view.getByPlaceholderText("New password"), "brandnew1");
		await user.type(view.getByPlaceholderText("Confirm password"), "brandnew1");
		await user.press(view.getByText("Reset Password"));

		expect(await view.findByText("Login route")).toBeOnTheScreen();
		expect(supabaseAuth.setSession).toHaveBeenCalledWith({
			access_token: "recovery-access",
			refresh_token: "recovery-refresh",
		});
		expect(supabaseAuth.updateUser).toHaveBeenCalledWith({
			password: "brandnew1",
		});
		expect(supabaseAuth.signOut).toHaveBeenCalled();
		// Recovery session is consumed on success.
		expect(getRecoverySessionUtils().getRecoverySession()).toBeNull();
	});

	it("does not submit when the two passwords differ", async () => {
		const user = userEvent.setup();
		getRecoverySessionUtils().setRecoverySession({
			accessToken: "recovery-access",
			refreshToken: "recovery-refresh",
			userType: "user",
		});

		const view = await renderResetPasswordRoute();

		await user.type(view.getByPlaceholderText("New password"), "brandnew1");
		await user.type(view.getByPlaceholderText("Confirm password"), "different2");
		await user.press(view.getByText("Reset Password"));

		expect(supabaseAuth.updateUser).not.toHaveBeenCalled();
	});
});
