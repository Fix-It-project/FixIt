import { env } from "@FixIt/env/native";
import axios from "axios";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import { logger } from "@/src/lib/logger";
import { useAuthStore } from "@/src/stores/auth-store";
import {
	type DiagnoseResponse,
	diagnoseResponseSchema,
} from "./schemas/response.schema";
import type { AgentOrderRequest, DiagnoseRequest } from "./types";

const AI_BASE_URL = env.EXPO_PUBLIC_AI_BASE_URL;

function requireAiBaseUrl() {
	if (!AI_BASE_URL) {
		throw new Error("EXPO_PUBLIC_AI_BASE_URL is not configured");
	}

	return AI_BASE_URL;
}

const diagnoseClient = axios.create({
	baseURL: requireAiBaseUrl(),
	timeout: 100000,
	headers: {
		"Content-Type": "application/json",
		"ngrok-skip-browser-warning": "true",
	},
});

const agentClient = axios.create({
	baseURL: requireAiBaseUrl(),
	timeout: 100000,
	headers: {
		"Content-Type": "application/json",
		"ngrok-skip-browser-warning": "true",
	},
});

diagnoseClient.interceptors.request.use((config) => {
	const { accessToken } = useAuthStore.getState();

	if (accessToken) {
		config.headers.Authorization = `Bearer ${accessToken}`;
	}

	return config;
});

type RawAiResponse = {
	success?: boolean;
	data?: {
		service_order?: unknown;
		raw_response?: unknown;
		assistant_message?: unknown;
		message?: unknown;
	};
	service_order?: unknown;
	serviceOrder?: unknown;
	assistant_message?: unknown;
	response?: unknown;
	message?: unknown;
	meta?: unknown;
};

type EmbeddedAgentResponse = {
	service_order?: unknown;
	serviceOrder?: unknown;
	assistant_message?: unknown;
	markdown?: unknown;
	message?: unknown;
	response?: unknown;
};

function parseRawResponse(data: unknown): RawAiResponse {
	const parsed = typeof data === "string" ? JSON.parse(data) : data;

	if (typeof parsed !== "object" || parsed === null) {
		return {};
	}

	return parsed as RawAiResponse;
}

function optionalString(value: unknown) {
	return typeof value === "string" ? value : undefined;
}

function parseEmbeddedAgentResponse(value: unknown): EmbeddedAgentResponse {
	const text = optionalString(value);
	if (!text) return {};

	const fencedJsonMatch = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
	const jsonCandidate = fencedJsonMatch?.[1] ?? /\{[\s\S]*\}/.exec(text)?.[0];
	if (!jsonCandidate) return {};

	try {
		const parsed = JSON.parse(jsonCandidate);
		if (typeof parsed !== "object" || parsed === null) return {};
		return parsed as EmbeddedAgentResponse;
	} catch {
		return {};
	}
}

function stripJsonBlocks(value: unknown) {
	const text = optionalString(value);
	if (!text) return undefined;

	const withoutFencedJson = text
		.replace(/```(?:json)?\s*[\s\S]*?```/gi, "")
		.trim();
	if (withoutFencedJson) return withoutFencedJson;

	const withoutInlineJson = text.replace(/\{[\s\S]*\}/, "").trim();
	return withoutInlineJson || undefined;
}

function firstVisibleText(...values: unknown[]) {
	for (const value of values) {
		const cleaned = stripJsonBlocks(value);
		if (cleaned) return cleaned;
	}

	return undefined;
}

export async function diagnoseIssue(
	payload: DiagnoseRequest,
): Promise<DiagnoseResponse> {
	const { data } = await diagnoseClient.post("/api/ai/diagnose", payload);

	const raw = parseRawResponse(data);

	const serviceOrder =
		raw?.data?.service_order ?? raw?.service_order ?? raw?.serviceOrder;
	const assistantMessage = optionalString(
		raw?.data?.assistant_message ??
			raw?.data?.message ??
			raw?.data?.raw_response ??
			raw?.assistant_message ??
			raw?.message,
	);

	const normalized = {
		success: raw?.success ?? true,
		data: {
			service_order: serviceOrder ?? null,
			assistant_message: assistantMessage ?? undefined,
		},
		meta: raw?.meta,
	};
	logger.debug("ai/api", "Diagnose API response", { normalized });
	return safeParseResponse(diagnoseResponseSchema, normalized, "diagnoseIssue");
}

export async function placeOrderWithAgent(
	payload: AgentOrderRequest,
): Promise<DiagnoseResponse> {
	const { session_id, ...body } = payload;
	const { data } = await agentClient.post("/api/ai/agent", body, {
		headers: {
			"X-Session-Id": session_id,
		},
	});

	const raw = parseRawResponse(data);
	const embedded = parseEmbeddedAgentResponse(raw.response ?? raw.message);

	const serviceOrder =
		raw?.data?.service_order ??
		raw?.service_order ??
		raw?.serviceOrder ??
		embedded.service_order ??
		embedded.serviceOrder;
	const assistantMessage = firstVisibleText(
		raw?.data?.assistant_message,
		raw?.data?.message,
		raw?.data?.raw_response,
		embedded.assistant_message,
		embedded.markdown,
		embedded.message,
		embedded.response,
		raw?.assistant_message,
		raw?.message,
		raw?.response,
	);

	const normalized = {
		success: raw?.success ?? true,
		data: {
			service_order: serviceOrder ?? null,
			assistant_message: assistantMessage ?? undefined,
		},
		meta: raw?.meta,
	};
	logger.debug("ai/api", "Agent API response", { normalized });
	return safeParseResponse(
		diagnoseResponseSchema,
		normalized,
		"placeOrderWithAgent",
	);
}
