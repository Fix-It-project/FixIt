import type { AppErrorCode } from "./codes";

export interface AppErrorOpts {
	devMessage?: string;
	cause?: unknown;
	status?: number;
	details?: unknown;
	retryable?: boolean;
	fields?: Record<string, string>;
	token?: string;
}

const DEFAULT_RETRYABLE: ReadonlySet<AppErrorCode> = new Set<AppErrorCode>([
	"NETWORK",
	"TIMEOUT",
	"RATE_LIMITED",
	"SERVER",
]);

export class AppError extends Error {
	public readonly code: AppErrorCode;
	public readonly userMessage: string;
	public readonly opts: AppErrorOpts;

	constructor(
		code: AppErrorCode,
		userMessage: string,
		opts: AppErrorOpts = {},
	) {
		super(opts.devMessage ?? code);
		this.name = "AppError";
		this.code = code;
		this.userMessage = userMessage;
		this.opts = opts;
		if (opts.cause !== undefined) {
			(this as { cause?: unknown }).cause = opts.cause;
		}
	}
}

export function isRetryable(err: AppError): boolean {
	if (err.opts.retryable !== undefined) return err.opts.retryable;
	return DEFAULT_RETRYABLE.has(err.code);
}

export * from "./codes";
export * from "./problem";
export * from "./map-http";
export * from "./map-supabase";
export * from "./map-zod";
