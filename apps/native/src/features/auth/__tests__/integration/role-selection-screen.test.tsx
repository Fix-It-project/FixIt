import { userEvent } from "@testing-library/react-native";
import { Text } from "react-native";

const reanimatedMock = require("../../../../../test/mocks/react-native-reanimated.js");

jest.doMock("react-native-reanimated/mock", () => reanimatedMock);
jest.doMock("react-native-reanimated", () => reanimatedMock);

function getRoutes() {
	return require("@/src/lib/navigation").ROUTES;
}

function getRouterTestingLibrary() {
	return require("expo-router/testing-library");
}

async function renderRoleSelectionRoute() {
	const RoleSelectionRoute = require("@/src/app/(auth)/role-selection").default;
	const { renderRouter } = getRouterTestingLibrary();
	const ROUTES = getRoutes();

	const result = renderRouter(
		{
			"(auth)/role-selection": RoleSelectionRoute,
			"(auth)/signup/index": () => <Text>User signup route</Text>,
			"(auth)/tech-signup/index": () => <Text>Technician signup route</Text>,
		},
		{ initialUrl: ROUTES.auth.roleSelection },
	);
	const renderResult = await result;
	return { router: result, ...renderResult };
}

describe("role-selection integration", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders both role cards", async () => {
		const view = await renderRoleSelectionRoute();

		expect(view.getByText("Choose your role")).toBeOnTheScreen();
		expect(view.getByTestId("role-user")).toBeOnTheScreen();
		expect(view.getByTestId("role-technician")).toBeOnTheScreen();
	});

	it("routes the Homeowner card to user signup", async () => {
		const user = userEvent.setup();
		const view = await renderRoleSelectionRoute();

		await user.press(view.getByTestId("role-user"));

		expect(await view.findByText("User signup route")).toBeOnTheScreen();
	});

	it("routes the Technician card to technician signup", async () => {
		const user = userEvent.setup();
		const view = await renderRoleSelectionRoute();

		await user.press(view.getByTestId("role-technician"));

		expect(await view.findByText("Technician signup route")).toBeOnTheScreen();
	});
});
