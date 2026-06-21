import type { Request, Response } from "express";
import { normalizeError } from "../../shared/errors/index.js";
import { requireActorId } from "../../shared/utils/request-auth.js";
import { addressesService } from "./addresses.service.js";

type OwnerRole = "user" | "technician";

function createAddressHandlers(role: OwnerRole) {
	function getOwnerId(req: Request): string {
		return requireActorId(req, role);
	}

	return {
		async getAddresses(req: Request, res: Response) {
			try {
				const ownerId = getOwnerId(req);
				const addresses = await addressesService.getAddresses(ownerId, role);
				return res.status(200).json({ addresses });
			} catch (err: unknown) {
				const { status, message } = normalizeError(err);
				return res
					.status(status === 500 ? 401 : status)
					.json({ error: message });
			}
		},

		async addAddress(req: Request, res: Response) {
			try {
				const ownerId = getOwnerId(req);
				const { city, street, building_no, apartment_no, latitude, longitude } =
					req.body;

				const address = await addressesService.addAddress(ownerId, role, {
					city,
					street,
					building_no,
					apartment_no,
					latitude,
					longitude,
				});
				return res.status(201).json({ address });
			} catch (err: unknown) {
				const { status, message } = normalizeError(err);
				let resolvedStatus = status;
				if (message.includes("Maximum of")) resolvedStatus = 409;
				else if (status === 500) resolvedStatus = 400;
				return res.status(resolvedStatus).json({ error: message });
			}
		},

		async updateAddress(req: Request, res: Response) {
			try {
				const ownerId = getOwnerId(req);
				const addressId = req.params.id as string;
				const { city, street, building_no, apartment_no, latitude, longitude } =
					req.body;
				const address = await addressesService.updateAddress(
					ownerId,
					role,
					addressId,
					{
						city,
						street,
						building_no,
						apartment_no,
						latitude,
						longitude,
					},
				);
				return res.status(200).json({ address });
			} catch (err: unknown) {
				const { status, message } = normalizeError(err);
				return res
					.status(status === 500 ? 400 : status)
					.json({ error: message });
			}
		},

		async deleteAddress(req: Request, res: Response) {
			try {
				const ownerId = getOwnerId(req);
				const addressId = req.params.id as string;
				const result = await addressesService.deleteAddress(
					ownerId,
					role,
					addressId,
				);
				return res.status(200).json(result);
			} catch (err: unknown) {
				const { status, message } = normalizeError(err);
				return res
					.status(status === 500 ? 400 : status)
					.json({ error: message });
			}
		},

		async setActiveAddress(req: Request, res: Response) {
			try {
				const ownerId = getOwnerId(req);
				const addressId = req.params.id as string;
				const address = await addressesService.setActiveAddress(
					ownerId,
					role,
					addressId,
				);
				return res.status(200).json({ address });
			} catch (err: unknown) {
				const { status, message } = normalizeError(err);
				return res
					.status(status === 500 ? 400 : status)
					.json({ error: message });
			}
		},
	};
}

export const userAddressHandlers = createAddressHandlers("user");
export const technicianAddressHandlers = createAddressHandlers("technician");
