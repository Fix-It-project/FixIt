import { CATEGORIES } from "@/src/features/categories/constants/categories";

export { getErrorMessage } from "@/src/lib/errors";

import type { ServiceOrder } from "../schemas/response.schema";
import type { RecommendationCard } from "./types";

function normalizeText(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim();
}

export function findCategoryByDiagnosis(categoryName: string) {
	const normalizedDiagnosis = normalizeText(categoryName);

	return CATEGORIES.find((category) => {
		const normalizedLabel = normalizeText(category.label);
		return (
			normalizedLabel === normalizedDiagnosis ||
			normalizedLabel.includes(normalizedDiagnosis) ||
			normalizedDiagnosis.includes(normalizedLabel)
		);
	});
}

export function scoreServiceMatch(serviceName: string, contextParts: string[]) {
	const normalizedServiceName = normalizeText(serviceName);
	if (!normalizedServiceName) return 0;

	const serviceTokens = normalizedServiceName.split(" ");
	let score = 0;

	for (const part of contextParts) {
		const normalizedPart = normalizeText(part);
		if (!normalizedPart) continue;

		if (normalizedPart.includes(normalizedServiceName)) {
			score += 10;
		}

		for (const token of serviceTokens) {
			if (token.length > 2 && normalizedPart.includes(token)) {
				score += 1;
			}
		}
	}

	return score;
}

export function createChatEntryId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getRecommendationCards(serviceOrder: ServiceOrder) {
	const assignedId =
		serviceOrder.assigned_technician.id == null
			? ""
			: String(serviceOrder.assigned_technician.id);
	const assignedName = serviceOrder.assigned_technician.name?.trim() ?? "";
	const cards: RecommendationCard[] = [];

	if (assignedId && assignedName) {
		cards.push({
			id: assignedId,
			name: assignedName,
			category: serviceOrder.assigned_technician.category,
			distance_km: serviceOrder.assigned_technician.distance_km,
			match_score: serviceOrder.assigned_technician.match_score,
			trust_score: serviceOrder.assigned_technician.trust_score,
			hourly_rate_egp: serviceOrder.assigned_technician.hourly_rate_egp,
			isAssigned: true,
		});
	}

	const seen = new Set<string>(assignedId ? [assignedId] : []);
	for (const technician of serviceOrder.all_recommendations ?? []) {
		const technicianId = String(technician.id || "");
		const technicianName = technician.name?.trim() ?? "";
		if (!technicianId || !technicianName || seen.has(technicianId)) continue;
		seen.add(technicianId);
		cards.push({
			id: technicianId,
			name: technicianName,
			category: technician.category,
			distance_km: technician.distance_km,
			match_score: technician.match_score,
			trust_score: technician.trust_score,
			hourly_rate_egp: technician.hourly_rate_egp,
		});
		if (cards.length === 3) break;
	}

	return cards;
}
