/** Time-of-day greeting for the hero header. */
export function greetingForHour(hour: number = new Date().getHours()): string {
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
}
