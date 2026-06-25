import { beforeEach, describe, expect, it, vi } from "vitest";

// expo-linking's `parse` isn't available in the node test env, so emulate its
// {scheme, hostname, path} extraction with the WHATWG URL parser. The hash /
// query-string handling under test runs against the raw string, not this mock.
vi.mock("expo-linking", () => ({
	parse: (url: string) => {
		const parsed = new URL(url);
		return {
			scheme: parsed.protocol.replace(/:$/, ""),
			hostname: parsed.hostname || null,
			path: parsed.pathname.replace(/^\/+/, "") || null,
			queryParams: {},
		};
	},
}));

import {
	consumeRecoveryDeepLink,
	parseRecoveryDeepLink,
} from "../recovery-deep-link";
import { clearRecoverySession, getRecoverySession } from "../recovery-session";

const RECOVERY_HASH =
	"#access_token=access-abc&refresh_token=refresh-abc&type=recovery";
const VALID_URL = `fixitapp:///reset-password${RECOVERY_HASH}`;

describe("parseRecoveryDeepLink", () => {
	it("extracts tokens from a valid recovery deep link", () => {
		expect(parseRecoveryDeepLink(VALID_URL)).toEqual({
			accessToken: "access-abc",
			refreshToken: "refresh-abc",
			userType: "user",
		});
	});

	it("accepts the host-form path (no leading slash)", () => {
		expect(
			parseRecoveryDeepLink(`fixitapp://reset-password${RECOVERY_HASH}`),
		).not.toBeNull();
	});

	it("returns null for a non-fixitapp scheme", () => {
		expect(
			parseRecoveryDeepLink(`https://reset-password${RECOVERY_HASH}`),
		).toBeNull();
	});

	it("returns null for the wrong path", () => {
		expect(parseRecoveryDeepLink(`fixitapp:///login${RECOVERY_HASH}`)).toBeNull();
	});

	it("returns null when the fragment is missing", () => {
		expect(parseRecoveryDeepLink("fixitapp:///reset-password")).toBeNull();
	});

	it("returns null when type is not 'recovery'", () => {
		expect(
			parseRecoveryDeepLink(
				"fixitapp:///reset-password#access_token=a&refresh_token=r&type=signup",
			),
		).toBeNull();
	});

	it("returns null when a token is absent", () => {
		expect(
			parseRecoveryDeepLink(
				"fixitapp:///reset-password#access_token=a&type=recovery",
			),
		).toBeNull();
	});
});

describe("consumeRecoveryDeepLink", () => {
	beforeEach(() => {
		clearRecoverySession();
	});

	it("stores the parsed session as a side effect for a valid link", () => {
		const session = consumeRecoveryDeepLink(VALID_URL);
		expect(session).not.toBeNull();
		expect(getRecoverySession()).toEqual(session);
	});

	it("does not store anything for an invalid link", () => {
		expect(consumeRecoveryDeepLink("fixitapp:///login")).toBeNull();
		expect(getRecoverySession()).toBeNull();
	});

	it("returns null without touching storage for null/empty input", () => {
		expect(consumeRecoveryDeepLink(null)).toBeNull();
		expect(consumeRecoveryDeepLink(undefined)).toBeNull();
		expect(consumeRecoveryDeepLink("")).toBeNull();
		expect(getRecoverySession()).toBeNull();
	});
});
