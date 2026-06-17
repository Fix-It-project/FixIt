import { useQuery } from "@tanstack/react-query";
import { getTechnicianWallet } from "../api/wallet";

export const technicianWalletKey = ["technician-wallet"] as const;

export function useTechnicianWalletQuery() {
	return useQuery({
		queryKey: technicianWalletKey,
		queryFn: getTechnicianWallet,
	});
}
