import axios from "axios";
import { safeParseResponse } from "@/src/lib/helpers/safe-parse";
import { diagnoseResponseSchema, type DiagnoseResponse } from "./schemas/response.schema";
import type { DiagnoseRequest } from "./types";

const FALLBACK_BASE_URL = "https://0395-41-41-246-59.ngrok-free.app";

const aiClient = axios.create({
    baseURL: FALLBACK_BASE_URL,
    timeout: 100000,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function diagnoseIssue(
    payload: DiagnoseRequest,
): Promise<DiagnoseResponse> {
    const { data } = await aiClient.post("/api/ai/diagnose", payload);

    const raw = typeof data === "string" ? (JSON.parse(data) as any) : data;

    const serviceOrder =
        raw?.data?.service_order ?? raw?.service_order ?? raw?.serviceOrder;
    const assistantMessage =
        raw?.data?.assistant_message ??
        raw?.data?.raw_response ??
        raw?.assistant_message ??
        raw?.message;

    const normalized = {
        success: raw?.success ?? true,
        data: {
            service_order: serviceOrder ?? null,
            assistant_message: assistantMessage,
        },
        meta: raw?.meta,
    };
    console.log("Diagnose API response:", normalized);
    return safeParseResponse(diagnoseResponseSchema, normalized, "diagnoseIssue");
}
