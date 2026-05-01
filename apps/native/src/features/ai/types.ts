export interface DiagnoseRequest {
	text: string;
	latitude: number;
	longitude: number;
	userId?: string | number | null;
	image?: string;
	audio?: string;
}

export interface AgentOrderRequest {
	session_id: string;
	message: string;
	audioBuffer?: string;
	image?: string;
}
