import crypto from "node:crypto";
import { getPaymobConfig } from "../../../config/paymob.js";
import { AppError } from "../../../shared/errors/index.js";

export interface PaymobBillingData {
	email: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	apartment: string;
	floor: string;
	street: string;
	building: string;
	city: string;
	state: string;
	country: string;
	postal_code: string;
}

export interface PaymobCardSessionInput {
	paymentId: string;
	orderId: string;
	amountCents: number;
	merchantOrderId: string;
	billingData: PaymobBillingData;
}

export interface PaymobCardSession {
	provider: "paymob";
	paymentId: string;
	clientSecret: string;
	publicKey: string | null;
	expiresAt: string;
	checkoutUrl: string;
}

export interface PaymobWebhookOutcome {
	provider: "paymob";
	externalEventId: string | null;
	paymentId: string;
	providerPaymentId: string | null;
	providerTransactionId: string | null;
	status: "paid" | "failed" | "cancelled";
	success: boolean;
	raw: unknown;
}

function stringifyStable(value: unknown): string {
	if (value === null || typeof value !== "object") {
		return JSON.stringify(value);
	}
	if (Array.isArray(value)) {
		return `[${value.map((item) => stringifyStable(item)).join(",")}]`;
	}
	const entries = Object.entries(value as Record<string, unknown>).sort(
		([a], [b]) => a.localeCompare(b),
	);
	return `{${entries
		.map(([key, item]) => `${JSON.stringify(key)}:${stringifyStable(item)}`)
		.join(",")}}`;
}

function paymentIdFromMerchantReference(reference: string | null): string {
	if (!reference) return "";
	const withoutPrefix = reference.replace(/^fixit-payment-/, "");
	const uuidMatch = withoutPrefix.match(
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
	);
	if (uuidMatch) return uuidMatch[0];
	return withoutPrefix.replace(/-\d{10,}$/, "");
}

type WebhookParams = Record<string, unknown>;

function firstString(value: unknown): string | null {
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return firstString(value[0]);
	return null;
}

// Returns the first argument that is a string (strict — no array unwrapping),
// mirroring the original nested-ternary precedence for merchant_order_id.
function pickString(...values: unknown[]): string | null {
	for (const value of values) {
		if (typeof value === "string") return value;
	}
	return null;
}

function coerceIdString(value: unknown): string | null {
	return typeof value === "number" || typeof value === "string"
		? String(value)
		: null;
}

function buildExternalEventId(
	body: Record<string, unknown>,
	obj: Record<string, unknown>,
): string | null {
	if (typeof body.type === "string") {
		return `${body.type}:${String(obj.id ?? "")}`;
	}
	if (typeof body.id === "string") return body.id;
	return null;
}

function valueAtPath(source: Record<string, unknown>, path: string): unknown {
	return path.split(".").reduce<unknown>((current, key) => {
		if (!current || typeof current !== "object") return undefined;
		return (current as Record<string, unknown>)[key];
	}, source);
}

function paymobHmacValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "object" && "id" in value) {
		return paymobHmacValue((value as { id?: unknown }).id);
	}
	return String(value);
}

function paymobBoolean(value: unknown): boolean {
	if (typeof value === "boolean") return value;
	if (typeof value === "string") return value.toLowerCase() === "true";
	if (typeof value === "number") return value === 1;
	return false;
}

function safeEqualHex(left: string, right: string): boolean {
	const a = Buffer.from(left.toLowerCase(), "hex");
	const b = Buffer.from(right.toLowerCase(), "hex");
	return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const PAYMOB_TRANSACTION_HMAC_FIELDS = [
	"amount_cents",
	"created_at",
	"currency",
	"error_occured",
	"has_parent_transaction",
	"id",
	"integration_id",
	"is_3d_secure",
	"is_auth",
	"is_capture",
	"is_refunded",
	"is_standalone_payment",
	"is_voided",
	"order",
	"owner",
	"pending",
	"source_data.pan",
	"source_data.sub_type",
	"source_data.type",
	"success",
] as const;

function transactionPayload(payload: unknown): Record<string, unknown> | null {
	if (!payload || typeof payload !== "object") return null;
	const body = payload as Record<string, unknown>;
	const obj =
		body.obj && typeof body.obj === "object"
			? (body.obj as Record<string, unknown>)
			: body;
	return obj && typeof obj === "object" ? obj : null;
}

function paymobTransactionHmac(
	payload: unknown,
	hmacSecret: string,
): string | null {
	const obj = transactionPayload(payload);
	if (!obj) return null;
	const raw = PAYMOB_TRANSACTION_HMAC_FIELDS.map((field) =>
		paymobHmacValue(valueAtPath(obj, field)),
	).join("");
	return crypto.createHmac("sha512", hmacSecret).update(raw).digest("hex");
}

async function postJson<T>(
	url: string,
	body: Record<string, unknown>,
	extraHeaders?: Record<string, string>,
): Promise<T> {
	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			...extraHeaders,
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		const text = await response.text();
		throw AppError.internal(
			"Card payment could not be started. Please try again.",
			{
				devMessage: `Paymob ${response.status}: ${text.slice(0, 500)}`,
				token: "paymob_request_failed",
			},
		);
	}

	return (await response.json()) as T;
}

export class PaymobAdapter {
	private readonly config = getPaymobConfig();

	private get platformLabel(): string {
		return this.config.sandboxMode ? "Paymob sandbox" : "Paymob";
	}

	/**
	 * Creates a Paymob payment session via the unified **Intention API**.
	 *
	 * The legacy `auth/tokens → ecommerce/orders → payment_keys` flow never told
	 * Paymob where to redirect/notify, so the gateway "pay" button had nowhere to
	 * return and timed out; callbacks could only be set in the dashboard. The
	 * Intention API takes `notification_url` (server webhook) and `redirection_url`
	 * (browser return) **in the request**, making the callbacks explicit and
	 * version-controlled. Auth is a Bearer **secret key** (not the public api_key).
	 */
	async createCardSession(
		input: PaymobCardSessionInput,
	): Promise<PaymobCardSession> {
		const cfg = this.config;
		if (!cfg.secretKey || !cfg.publicKey || !cfg.integrationId) {
			throw AppError.internal(
				"Card payment is not configured yet. Please pay cash or try again later.",
				{
					devMessage: `${this.platformLabel} is missing PAYMOB_SECRET_KEY, PAYMOB_PUBLIC_KEY, or PAYMOB_INTEGRATION_ID`,
					token: "paymob_not_configured",
				},
			);
		}

		const intention = await postJson<{ client_secret?: string; id?: string }>(
			cfg.intentionUrl,
			{
				amount: input.amountCents,
				currency: cfg.currency,
				payment_methods: [Number(cfg.integrationId)],
				items: [],
				billing_data: input.billingData,
				customer: {
					first_name: input.billingData.first_name,
					last_name: input.billingData.last_name,
					email: input.billingData.email,
				},
				// merchant_order_id equivalent; webhook echoes this back so we can
				// recover our payment id (`fixit-payment-<paymentId>`).
				special_reference: input.merchantOrderId,
				...(cfg.notificationUrl
					? { notification_url: cfg.notificationUrl }
					: {}),
				...(cfg.redirectionUrl ? { redirection_url: cfg.redirectionUrl } : {}),
			},
			{ Authorization: `Token ${cfg.secretKey}` },
		);

		const clientSecret = intention.client_secret;
		if (!clientSecret) {
			throw AppError.internal(
				"Card payment could not be started. Please try again.",
				{
					devMessage: "Paymob intention returned no client_secret",
					token: "paymob_request_failed",
				},
			);
		}

		const checkoutUrl = `${cfg.unifiedCheckoutUrl}?publicKey=${encodeURIComponent(cfg.publicKey)}&clientSecret=${encodeURIComponent(clientSecret)}`;

		return {
			provider: "paymob",
			paymentId: input.paymentId,
			clientSecret,
			publicKey: cfg.publicKey,
			expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
			checkoutUrl,
		};
	}

	verifyWebhook(
		payload: unknown,
		headers: Record<string, string | string[] | undefined>,
		query: WebhookParams = {},
	): void {
		if (!this.config.hmacSecret) {
			throw AppError.badRequest(
				`${this.platformLabel} webhook secret is not configured`,
				{
					token: "paymob_webhook_not_configured",
				},
			);
		}

		const signatureHeader =
			headers["x-paymob-signature"] ??
			headers["x-paymob-hmac"] ??
			headers["x-signature"];
		const signature = Array.isArray(signatureHeader)
			? signatureHeader[0]
			: (signatureHeader ??
				firstString(query.hmac) ??
				firstString((payload as Record<string, unknown> | null)?.hmac));

		if (!signature) {
			throw AppError.badRequest("Missing Paymob webhook signature", {
				token: "paymob_missing_signature",
			});
		}

		const transactionExpected = paymobTransactionHmac(
			payload,
			this.config.hmacSecret,
		);
		if (
			transactionExpected &&
			/^[a-f0-9]+$/i.test(signature) &&
			safeEqualHex(signature, transactionExpected)
		) {
			return;
		}

		const stableJsonExpected = crypto
			.createHmac("sha512", this.config.hmacSecret)
			.update(stringifyStable(payload))
			.digest("hex");

		if (
			!/^[a-f0-9]+$/i.test(signature) ||
			!safeEqualHex(signature, stableJsonExpected)
		) {
			throw AppError.forbidden("Invalid Paymob webhook signature", {
				token: "paymob_invalid_signature",
			});
		}
	}

	extractPaymentOutcome(payload: unknown): PaymobWebhookOutcome {
		const body = payload as Record<string, unknown>;
		const obj =
			body.obj && typeof body.obj === "object"
				? (body.obj as Record<string, unknown>)
				: body;
		const success = paymobBoolean(obj.success);
		const pending = paymobBoolean(obj.pending);
		const order =
			obj.order && typeof obj.order === "object"
				? (obj.order as Record<string, unknown>)
				: null;

		const merchantOrderId = pickString(
			order?.merchant_order_id,
			obj.merchant_order_id,
			body.merchant_order_id,
			obj.special_reference,
			body.special_reference,
		);
		const paymentId = paymentIdFromMerchantReference(merchantOrderId);

		if (!paymentId) {
			throw AppError.badRequest("Paymob webhook is missing merchant_order_id", {
				token: "paymob_missing_payment_id",
			});
		}

		let status: PaymobWebhookOutcome["status"] = "failed";
		if (success) status = "paid";
		else if (pending) status = "cancelled";

		return {
			provider: "paymob",
			externalEventId: buildExternalEventId(body, obj),
			paymentId,
			providerPaymentId: coerceIdString(order?.id) ?? coerceIdString(obj.order),
			providerTransactionId: coerceIdString(obj.id),
			status,
			success,
			raw: payload,
		};
	}
}

export const paymobAdapter = new PaymobAdapter();
