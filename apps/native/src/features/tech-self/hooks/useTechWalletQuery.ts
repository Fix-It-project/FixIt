import { useQuery } from "@tanstack/react-query";
import { getTechnicianWallet } from "@/src/features/tech-self/api/tech-self";

/**
 * Technician wallet for the profile screen: lifetime earnings (sum of paid
 * payments — not a withdrawable balance) plus the 30-day earnings series that
 * feeds the profile area chart.
 */
export function useTechWalletQuery() {
	return useQuery({
		queryKey: ["technician", "wallet"],
		queryFn: getTechnicianWallet,
		staleTime: 5 * 60 * 1000,
	});
}
