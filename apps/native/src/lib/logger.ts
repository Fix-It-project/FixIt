type Level = "debug" | "info" | "warn" | "error";

type Breadcrumb = {
	category: string;
	message: string;
	level: Level;
	data?: object;
	timestamp: number;
};

type BreadcrumbSink = (b: Breadcrumb) => void;
type CaptureSink = (err: unknown, ctx?: object) => void;

let breadcrumbSink: BreadcrumbSink = () => {};
let captureSink: CaptureSink = () => {};

const REDACTED = "[REDACTED]";
const SENSITIVE_KEY_PATTERN =
	/(authorization|token|password|secret|session|cookie|email|phone|address|national|criminal|certificate|base64|uri)/i;
const isDev = typeof __DEV__ !== "undefined" && __DEV__;

export function __setBreadcrumbSink(fn: BreadcrumbSink): void {
	breadcrumbSink = fn;
}

export function __setCaptureSink(fn: CaptureSink): void {
	captureSink = fn;
}

function safeCall(fn: () => void): void {
	try {
		fn();
	} catch {}
}

function sanitizeForLog(
	value: unknown,
	depth = 0,
	seen = new WeakSet<object>(),
): unknown {
	if (depth > 6) return "[MaxDepth]";
	if (value === null || value === undefined) return value;
	if (typeof value === "string") {
		if (/^Bearer\s+/i.test(value)) return REDACTED;
		if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) {
			return REDACTED;
		}
		return value;
	}
	if (typeof value !== "object") return value;
	if (value instanceof Error) {
		return {
			name: value.name,
			message: value.message,
			stack: isDev ? value.stack : undefined,
		};
	}
	if (seen.has(value)) return "[Circular]";
	seen.add(value);
	if (Array.isArray(value)) {
		return value.map((item) => sanitizeForLog(item, depth + 1, seen));
	}

	const out: Record<string, unknown> = {};
	for (const [key, nested] of Object.entries(
		value as Record<string, unknown>,
	)) {
		out[key] = SENSITIVE_KEY_PATTERN.test(key)
			? REDACTED
			: sanitizeForLog(nested, depth + 1, seen);
	}
	return out;
}

function emit(
	level: Level,
	category: string,
	message: string,
	data?: object,
): void {
	const sanitizedData = data ? (sanitizeForLog(data) as object) : undefined;
	safeCall(() => {
		if (isDev) {
			const tag = `[${category}]`;
			if (sanitizedData !== undefined) {
				console[level](tag, message, sanitizedData);
			} else {
				console[level](tag, message);
			}
		}
	});
	safeCall(() => {
		breadcrumbSink({
			category,
			message,
			level,
			data: sanitizedData,
			timestamp: Date.now() / 1000,
		});
	});
}

export const logger = {
	debug(category: string, message: string, data?: object): void {
		emit("debug", category, message, data);
	},
	info(category: string, message: string, data?: object): void {
		emit("info", category, message, data);
	},
	warn(category: string, message: string, data?: object): void {
		emit("warn", category, message, data);
	},
	error(category: string, message: string, errorOrData?: unknown): void {
		const data =
			errorOrData &&
			typeof errorOrData === "object" &&
			!(errorOrData instanceof Error)
				? (sanitizeForLog(errorOrData) as object)
				: undefined;
		const consolePayload = sanitizeForLog(errorOrData);
		safeCall(() => {
			if (isDev) {
				console.error(`[${category}]`, message, consolePayload);
			}
		});
		safeCall(() => {
			breadcrumbSink({
				category,
				message,
				level: "error",
				data,
				timestamp: Date.now() / 1000,
			});
		});
		safeCall(() => {
			captureSink(errorOrData, { category, message });
		});
	},
};
