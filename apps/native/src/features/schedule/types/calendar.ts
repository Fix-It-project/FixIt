export interface DaySchedule {
	day_of_week: number; // 0-6
	dayName: string;
	enabled: boolean;
}

export interface CreateTemplatePayload {
	day_of_week: number;
	active: boolean;
}

export interface UpdateTemplatePayload {
	active: boolean;
}

export interface CreateExceptionPayload {
	date: string; // YYYY-MM-DD
}
