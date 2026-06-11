import serverlessExpress from "@codegenie/serverless-express";
import type { Express } from "express";

type LambdaHandler = (
	event: unknown,
	context: unknown,
) => Promise<unknown> | unknown;

export function createHttpHandler(app: Express): LambdaHandler {
	const expressHandler = serverlessExpress({ app });

	return async (event, context) => {
		if (
			event &&
			typeof event === "object" &&
			"source" in event &&
			(event as { source?: unknown }).source === "serverless-plugin-warmup"
		) {
			return {
				statusCode: 200,
				body: JSON.stringify({ message: "Lambda is warm" }),
			};
		}

		return expressHandler(event as never, context as never);
	};
}
