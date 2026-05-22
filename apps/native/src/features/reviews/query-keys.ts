export const reviewQueryKeys = {
	all: ["reviews"] as const,
	technician: (technicianId: string | null) =>
		[...reviewQueryKeys.all, "technician", technicianId] as const,
	technicianPage: (
		technicianId: string | null,
		limit: number,
		offset: number,
	) =>
		[
			...reviewQueryKeys.technician(technicianId),
			"page",
			limit,
			offset,
		] as const,
	technicianInfinite: (technicianId: string | null, pageSize: number) =>
		[
			...reviewQueryKeys.technician(technicianId),
			"infinite",
			pageSize,
		] as const,
};
