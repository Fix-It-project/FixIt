import type { ZodError } from "zod";
import { AppError } from "./index";

const USER_MESSAGE = "Please check the highlighted fields.";

/**
 * Map a ZodError to an AppError with `opts.fields` as a flat map of
 * dotted path → first issue message.
 */
export function mapZodError(err: ZodError): AppError {
	const fields: Record<string, string> = {};
	const issues = (err.issues ?? []) as Array<{
		path?: ReadonlyArray<PropertyKey>;
		message?: string;
	}>;
	for (const issue of issues) {
		const path = (issue.path ?? []).map(String).join(".");
		const key = path.length > 0 ? path : "_";
		if (!(key in fields) && typeof issue.message === "string") {
			fields[key] = issue.message;
		}
	}
	return new AppError("VALIDATION", USER_MESSAGE, {
		fields,
		cause: err,
	});
}
