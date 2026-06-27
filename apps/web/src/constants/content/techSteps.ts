import { mockups } from "./mockups";
import type { Step } from "./steps";

// Technician-side mirror of `steps` (the customer how-it-works). Same shape so it
// can render through the same numbered-timeline row. Screens are real technician
// captures: set-up-schedule, jobs, and the schedule calendar.
export const techSteps: readonly Step[] = [
	{
		n: "01",
		title: "Set your availability",
		body: "Switch on the days you take jobs and pick the visit times you offer. Change it whenever your week changes.",
		mockup: mockups.techScheduleSetup,
	},
	{
		n: "02",
		title: "Jobs come to you",
		body: "Nearby requests land in your Jobs tab with the service, inspection fee, and distance. Accept the ones that fit.",
		mockup: mockups.techJobs,
	},
	{
		n: "03",
		title: "Run your day",
		body: "Track every booking on your calendar, reschedule when plans shift, and get paid for each visit: cash or card.",
		mockup: mockups.techCalendar,
	},
];
