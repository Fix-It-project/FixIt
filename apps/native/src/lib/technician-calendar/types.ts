// Technician-calendar payload/value types. Cross-feature: used by user booking
// (booked slots, public schedule) AND the technician schedule feature, so it
// lives in lib/ rather than inside any single feature.

export interface SlotSchedule {
	slot_hour: number;
	active: boolean;
}

export interface DaySchedule {
	day_of_week: number; // 0-6 (Sunday-Saturday)
	dayName: string;
	enabled: boolean;
	slots: SlotSchedule[];
}

export interface CreateTemplatePayload {
	day_of_week: number;
	slot_hour: number;
	active: boolean;
}

export interface UpdateTemplatePayload {
	active: boolean;
}

export interface CreateExceptionPayload {
	date: string; // YYYY-MM-DD
}
