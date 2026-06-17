import apiClient from "@/src/config/api-client";
import { safeParseResponse } from "@/src/lib/api/safe-parse";
import {
	type TechnicianWallet,
	technicianWalletSchema,
} from "../schemas/wallet.schema";

export async function getTechnicianWallet(): Promise<TechnicianWallet> {
	const response = await apiClient.get("/api/technicians/me/wallet");
	return safeParseResponse(
		technicianWalletSchema,
		response.data,
		"getTechnicianWallet",
	);
}
