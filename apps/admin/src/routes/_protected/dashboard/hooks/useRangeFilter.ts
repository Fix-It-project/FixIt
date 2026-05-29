import { useState } from "react";
import type { Range } from "@/types";

export function useRangeFilter() {
	const [range, setRange] = useState<Range>("30d");
	return { range, setRange };
}
