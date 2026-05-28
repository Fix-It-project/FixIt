import type * as React from "react";
import { View } from "react-native";
import { Button } from "@/src/components/ui/button";
import { Text } from "@/src/components/ui/text";
import { Sentry } from "@/src/config/monitoring";

type FatalScreenProps = {
	error: unknown;
	resetError: () => void;
};

export function FatalScreen({ error, resetError }: FatalScreenProps) {
	const message = error instanceof Error ? error.message : "Unknown error";

	return (
		<View className="flex-1 items-center justify-center bg-surface px-screen-x">
			<Text variant="h2" className="text-center text-content">
				Something went wrong
			</Text>
			<Text
				variant="bodyLg"
				className="mt-stack-sm text-center text-content-secondary"
			>
				We've reported this issue. You can try again.
			</Text>
			{__DEV__ ? (
				<Text
					variant="bodySm"
					className="mt-stack-sm text-center text-content-secondary"
				>
					{message}
				</Text>
			) : null}
			<Button onPress={resetError} className="mt-stack-md">
				<Text>Try again</Text>
			</Button>
		</View>
	);
}

export function RouteErrorBoundary({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<Sentry.ErrorBoundary fallback={FatalScreen}>
			{children}
		</Sentry.ErrorBoundary>
	);
}
