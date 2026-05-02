import axios from "axios";
import { CATEGORIES } from "@/src/lib/helpers/categories";
import type { ServiceOrder } from "../schemas/response.schema";
import type { RecommendationCard } from "./types";

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseMessage =
      typeof error.response?.data === "string"
        ? error.response.data
        : typeof error.response?.data?.error === "string"
          ? error.response.data.error
          : typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : null;

    if (responseMessage) {
      return responseMessage;
    }
  }

  return error instanceof Error ? error.message : null;
}

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
  const assignedId = String(serviceOrder.assigned_technician.id);
  const cards: RecommendationCard[] = [
    {
      id: assignedId,
      name: serviceOrder.assigned_technician.name,
      category: serviceOrder.assigned_technician.category,
      distance_km: serviceOrder.assigned_technician.distance_km,
      match_score: serviceOrder.assigned_technician.match_score,
      trust_score: serviceOrder.assigned_technician.trust_score,
      hourly_rate_egp: serviceOrder.assigned_technician.hourly_rate_egp,
      isAssigned: true,
    },
  ];

  const seen = new Set<string>([assignedId]);
  for (const technician of serviceOrder.all_recommendations ?? []) {
    const technicianId = String(technician.id || "");
    if (!technicianId || seen.has(technicianId)) continue;
    seen.add(technicianId);
    cards.push({
      id: technicianId,
      name: technician.name,
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
