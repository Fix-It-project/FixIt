import type { Request } from "express";
import { AppError } from "../errors/index.js";

export type AuthActor = "user" | "technician";

export function requireUserId(req: Request): string {
	const userId = req.user?.id;
	if (!userId) {
		throw AppError.unauthorized("Not authenticated");
	}
	return userId;
}

export function requireTechnicianId(req: Request): string {
	const technicianId = req.technician?.id;
	if (!technicianId) {
		throw AppError.unauthorized("Not authenticated");
	}
	return technicianId;
}

export function requireActorId(req: Request, actor: AuthActor): string {
	return actor === "user" ? requireUserId(req) : requireTechnicianId(req);
}
