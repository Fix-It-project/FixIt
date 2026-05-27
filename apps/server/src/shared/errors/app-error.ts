import {
	type AppErrorCode,
	type AppErrorOpts,
	AppError as BaseAppError,
} from "@FixIt/errors";

export type { AppErrorCode, AppErrorOpts };

// Extend AppError with static factory methods for backwards compatibility
export class AppError extends BaseAppError {
	status: number;

	constructor(
		code: AppErrorCode,
		userMessage: string,
		opts: AppErrorOpts = {},
	) {
		super(code, userMessage, opts);
		this.status = opts.status || 500;
		// Override message to be userMessage for backwards compatibility with tests
		this.message = userMessage;
	}

	static badRequest(message: string, opts?: AppErrorOpts): AppError {
		return new AppError("VALIDATION", message, { ...opts, status: 400 });
	}

	static unauthorized(message: string, opts?: AppErrorOpts): AppError {
		return new AppError("UNAUTHENTICATED", message, { ...opts, status: 401 });
	}

	static forbidden(message: string, opts?: AppErrorOpts): AppError {
		return new AppError("FORBIDDEN", message, { ...opts, status: 403 });
	}

	static notFound(message: string, opts?: AppErrorOpts): AppError {
		return new AppError("NOT_FOUND", message, { ...opts, status: 404 });
	}

	static conflict(message: string, opts?: AppErrorOpts): AppError {
		return new AppError("CONFLICT", message, { ...opts, status: 409 });
	}

	static internal(message: string, opts?: AppErrorOpts): AppError {
		return new AppError("SERVER", message, { ...opts, status: 500 });
	}
}

// For backwards compatibility, re-export as default
export default AppError;
