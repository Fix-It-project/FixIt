// Centralized TanStack query keys for the technicians feature.
//
// All consumers (queries, mutations, invalidations) MUST use these helpers
// so renames stay safe and key shapes stay consistent.

export const technicianQueryKeys = {
	all: ["technicians"] as const,
	list: () => ["technicians"] as const,
	profile: (technicianId: string) => ["technician-profile", technicianId] as const,
};
