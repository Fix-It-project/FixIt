import { describe, expect, it } from "vitest";
import {
	mergeTechnicianServices,
	type TechnicianServiceDTO,
} from "../../technicians.repository.js";

function service(
	id: string,
	name: string,
	overrides: Partial<TechnicianServiceDTO> = {},
): TechnicianServiceDTO {
	return {
		id,
		name,
		description: `${name} description`,
		min_price: 100,
		max_price: 200,
		...overrides,
	};
}

describe("mergeTechnicianServices", () => {
	it("keeps category defaults when technician has an approved custom service", () => {
		const result = mergeTechnicianServices(
			[
				service("default-2", "Window cleaning"),
				service("default-1", "Dusting"),
			],
			[service("custom-1", "Deep kitchen reset")],
		);

		expect(result.map((item) => item.id)).toEqual([
			"custom-1",
			"default-1",
			"default-2",
		]);
	});

	it("dedupes explicit links by service id", () => {
		const result = mergeTechnicianServices(
			[service("svc-1", "Home cleaning", { min_price: 100 })],
			[service("svc-1", "Home cleaning", { min_price: 150 })],
		);

		expect(result).toHaveLength(1);
		expect(result[0]?.min_price).toBe(150);
	});
});
