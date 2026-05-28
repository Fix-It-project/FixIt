import { TriangleAlert } from "lucide-react-native";
import { Alert, AlertDescription } from "@/src/components/ui/alert";

interface ErrorBannerProps {
	readonly message: string | null;
	readonly variant?: "default" | "warning";
}

export default function ErrorBanner({
	message,
	variant = "default",
}: ErrorBannerProps) {
	if (!message) return null;

	if (variant === "warning") {
		return (
			<Alert
				icon={TriangleAlert}
				className="mx-screen-x mb-stack-lg rounded-input border-warning bg-warning-light"
				iconClassName="text-warning"
			>
				<AlertDescription className="text-warning">{message}</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert
			icon={TriangleAlert}
			variant="destructive"
			className="rounded-card border-danger bg-danger-light"
		>
			<AlertDescription className="text-center text-danger">
				{message}
			</AlertDescription>
		</Alert>
	);
}
