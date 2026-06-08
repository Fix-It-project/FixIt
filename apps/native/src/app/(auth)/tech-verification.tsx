import { useLocalSearchParams } from "expo-router";
import { VerificationScreen } from "@/src/features/auth/components/verification/VerificationScreen";
import type { TechVerificationState } from "@/src/lib/navigation";

function resolveState(value: string | undefined): TechVerificationState {
	return value === "blocked" || value === "rejected" ? value : "pending";
}

export default function TechVerification() {
	const params = useLocalSearchParams<{
		state?: string;
		email?: string;
		message?: string;
		approved?: string;
	}>();

	return (
		<VerificationScreen
			state={resolveState(params.state)}
			email={params.email}
			message={params.message}
			initialApproved={params.approved === "true"}
		/>
	);
}
