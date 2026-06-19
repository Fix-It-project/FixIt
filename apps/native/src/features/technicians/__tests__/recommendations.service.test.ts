import * as SecureStore from "expo-secure-store";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import apiClient from "@/src/config/api-client";
import { supabase } from "@/src/config/supabase";

vi.mock("expo-secure-store", () => ({
	getItemAsync: vi.fn(),
}));

vi.mock("@/src/config/api-client", () => ({
	default: {
		get: vi.fn(),
	},
}));

vi.mock("@/src/config/supabase", () => ({
	supabase: {
		auth: {
			getSession: vi.fn(),
			getUser: vi.fn(),
		},
	},
}));

vi.mock("@/src/lib/logger", () => ({
	logger: {
		warn: vi.fn(),
	},
}));

vi.mock("@/src/stores/auth-store", () => ({
	useAuthStore: {
		getState: vi.fn(() => ({})),
	},
}));

async function loadService(recommendationApiUrl = "http://localhost:8000") {
	vi.stubEnv("EXPO_PUBLIC_SERVER_URL", "http://localhost:3000");
	vi.stubEnv("EXPO_PUBLIC_RECOMMENDATION_API_URL", recommendationApiUrl);
	const service = await import("../recommendations.service");
	return service;
}

function mockRecommendationDependencies() {
	vi.mocked(supabase.auth.getSession).mockResolvedValue({
		data: { session: null },
		error: null,
	});
	vi.mocked(supabase.auth.getUser).mockResolvedValue({
		data: { user: null },
		error: null,
	} as unknown as Awaited<ReturnType<typeof supabase.auth.getUser>>);
	vi.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
	vi.mocked(apiClient.get).mockResolvedValue({
		data: {
			addresses: [
				{
					id: "address-1",
					latitude: 30.06,
					longitude: 31.32,
					is_active: true,
					created_at: "2026-01-01T00:00:00.000Z",
				},
			],
		},
	});
}

describe("recommendations.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
		vi.resetModules();
	});

	it("expands short problem descriptions before calling the recommendation API", async () => {
		const { normalizeRecommendationProblemDescription } = await loadService();

		expect(normalizeRecommendationProblemDescription("AC")).toBe(
			"Need AC service",
		);
	});

	it("keeps descriptive problem text intact after trimming whitespace", async () => {
		const { normalizeRecommendationProblemDescription } = await loadService();

		expect(normalizeRecommendationProblemDescription("  leaking sink  ")).toBe(
			"leaking sink",
		);
	});

	it("sends API-valid recommendation request bodies for short search terms", async () => {
		mockRecommendationDependencies();

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify({ recommendations: [] }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const { getRecommendedTechnicians } = await loadService();

		await getRecommendedTechnicians({
			problemDescription: "AC",
			topK: 5,
		});

		const [, init] = fetchMock.mock.calls[0];
		const body = JSON.parse(String(init?.body));

		expect(fetchMock.mock.calls[0]?.[0]).toBe(
			"http://localhost:8000/api/recommend",
		);
		expect(body).toMatchObject({
			user_id: null,
			problem_description: "Need AC service",
			latitude: 30.06,
			longitude: 31.32,
			radius_km: 10,
			top_k: 5,
		});
	});

	it("treats recommendation API 404 as an empty result set", async () => {
		mockRecommendationDependencies();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: async () =>
					JSON.stringify({
						detail: "No technicians found within the search radius.",
					}),
			}),
		);

		const { getRecommendedTechnicians } = await loadService();

		await expect(
			getRecommendedTechnicians({
				problemDescription: "leaking sink",
				topK: 5,
			}),
		).resolves.toEqual([]);
	});

	it("maps recommendation API validation failures to typed app errors", async () => {
		mockRecommendationDependencies();

		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: false,
				status: 422,
				text: async () =>
					JSON.stringify({
						detail: [
							{
								type: "string_too_short",
								loc: ["body", "problem_description"],
								msg: "String should have at least 5 characters",
							},
						],
					}),
			}),
		);

		const { getRecommendedTechnicians } = await loadService();

		await expect(
			getRecommendedTechnicians({
				problemDescription: "AC",
				topK: 5,
			}),
		).rejects.toMatchObject({
			code: "VALIDATION",
			opts: { status: 422 },
		});
	});

	it("normalizes recommendation API base URLs with trailing slashes", async () => {
		mockRecommendationDependencies();

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify({ recommendations: [] }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const { getRecommendedTechnicians } = await loadService(
			"http://localhost:8000/",
		);

		await getRecommendedTechnicians({
			problemDescription: "leaking sink",
			topK: 5,
		});

		expect(fetchMock.mock.calls[0]?.[0]).toBe(
			"http://localhost:8000/api/recommend",
		);
	});

	it("does not duplicate /api when the configured recommendation URL includes it", async () => {
		mockRecommendationDependencies();

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			text: async () => JSON.stringify({ recommendations: [] }),
		});
		vi.stubGlobal("fetch", fetchMock);

		const { getRecommendedTechnicians } = await loadService(
			"http://localhost:8000/api",
		);

		await getRecommendedTechnicians({
			problemDescription: "leaking sink",
			topK: 5,
		});

		expect(fetchMock.mock.calls[0]?.[0]).toBe(
			"http://localhost:8000/api/recommend",
		);
	});
});
