import { useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { BlockedScreen } from "@/src/features/auth/components/blocked/BlockedScreen";
import type { BlockedRole } from "@/src/lib/navigation";
import { useAuthStore } from "@/src/stores/auth-store";

function resolveRole(value: string | undefined): BlockedRole {
	return value === "technician" ? "technician" : "user";
}

export default function Blocked() {
	const params = useLocalSearchParams<{
		role?: string;
		email?: string;
		message?: string;
		reason?: string;
	}>();

	// Belt-and-suspenders: wipe any lingering session so a blocked account can't
	// slip through with a stale token.
	useEffect(() => {
		void useAuthStore.getState().clearSession();
	}, []);

	return (
		<BlockedScreen
			role={resolveRole(params.role)}
			email={params.email}
			message={params.message}
			reason={params.reason}
		/>
	);
}
