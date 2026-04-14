export interface RecoverySession {
	accessToken: string;
	refreshToken: string;
	userType: "user" | "technician";
}

let recoverySession: RecoverySession | null = null;

export function setRecoverySession(session: RecoverySession) {
	recoverySession = session;
}

export function getRecoverySession() {
	return recoverySession;
}

export function clearRecoverySession() {
	recoverySession = null;
}
