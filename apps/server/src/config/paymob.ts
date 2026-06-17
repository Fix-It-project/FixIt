import { env } from "@FixIt/env/server";

const DEFAULT_PAYMOB_BASE_URL = "https://accept.paymob.com/api";
const DEFAULT_PAYMOB_IFRAME_BASE_URL =
	"https://accept.paymob.com/api/acceptance/iframes";
const DEFAULT_PAYMOB_UNIFIED_CHECKOUT_URL =
	"https://accept.paymob.com/unifiedcheckout/";

const WEBHOOK_PATH = "/api/orders/webhooks/paymob";
const REDIRECT_PATH = "/api/orders/payments/return";

export interface PaymobConfig {
	apiKey: string | null;
	secretKey: string | null;
	publicKey: string | null;
	integrationId: string | null;
	iframeId: string | null;
	hmacSecret: string | null;
	/** Legacy REST root (auth/tokens, ecommerce/orders, acceptance/*). */
	baseUrl: string;
	/** Unified Intention API endpoint (Bearer = secret key). */
	intentionUrl: string;
	/** Unified Checkout page; receives `publicKey` + `clientSecret`. */
	unifiedCheckoutUrl: string;
	/** Legacy iframe base (kept only as a fallback path). */
	iframeBaseUrl: string;
	currency: string;
	platformFeePercent: number;
	sandboxMode: boolean;
	/** Paymob → server webhook target; null when API_PUBLIC_URL is unset. */
	notificationUrl: string | null;
	/** Browser return target after the gateway; null when API_PUBLIC_URL is unset. */
	redirectionUrl: string | null;
}

function joinUrl(base: string, path: string): string {
	return `${base.replace(/\/+$/, "")}${path}`;
}

function deriveIntentionUrl(baseUrl: string): string {
	// baseUrl is the REST root (".../api"); the Intention API lives at the host root.
	try {
		const url = new URL(baseUrl);
		return `${url.protocol}//${url.host}/v1/intention/`;
	} catch {
		return "https://accept.paymob.com/v1/intention/";
	}
}

export function getPaymobConfig(): PaymobConfig {
	const baseUrl = env.PAYMOB_BASE_URL ?? DEFAULT_PAYMOB_BASE_URL;
	const apiPublicUrl = env.API_PUBLIC_URL ?? null;
	return {
		apiKey: env.PAYMOB_API_KEY ?? null,
		secretKey: env.PAYMOB_SECRET_KEY ?? null,
		publicKey: env.PAYMOB_PUBLIC_KEY ?? null,
		integrationId: env.PAYMOB_INTEGRATION_ID ?? null,
		iframeId: env.PAYMOB_IFRAME_ID ?? null,
		hmacSecret: env.PAYMOB_HMAC_SECRET ?? null,
		baseUrl,
		intentionUrl: deriveIntentionUrl(baseUrl),
		unifiedCheckoutUrl:
			env.PAYMOB_UNIFIED_CHECKOUT_URL ?? DEFAULT_PAYMOB_UNIFIED_CHECKOUT_URL,
		iframeBaseUrl: env.PAYMOB_IFRAME_BASE_URL ?? DEFAULT_PAYMOB_IFRAME_BASE_URL,
		currency: env.PAYMOB_CURRENCY,
		platformFeePercent: env.PAYMOB_PLATFORM_FEE_PERCENT,
		sandboxMode: env.PAYMOB_SANDBOX_MODE,
		notificationUrl: apiPublicUrl ? joinUrl(apiPublicUrl, WEBHOOK_PATH) : null,
		redirectionUrl: apiPublicUrl ? joinUrl(apiPublicUrl, REDIRECT_PATH) : null,
	};
}
