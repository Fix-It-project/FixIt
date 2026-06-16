import { create } from "zustand";

/**
 * In-memory (NON-persisted) accordion state for the schedule month calendar.
 * Survives tab switches (module singleton) but resets to collapsed on a fresh
 * app launch — exactly the behaviour the schedule page wants.
 */
interface ScheduleAccordionState {
	calendarOpen: boolean;
	setCalendarOpen: (open: boolean) => void;
	toggleCalendar: () => void;
}

export const useScheduleAccordionStore = create<ScheduleAccordionState>(
	(set) => ({
		calendarOpen: false,
		setCalendarOpen: (open) => set({ calendarOpen: open }),
		toggleCalendar: () => set((s) => ({ calendarOpen: !s.calendarOpen })),
	}),
);
