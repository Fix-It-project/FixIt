import { Redirect } from "expo-router";
import { ROUTES } from "@/src/lib/navigation";

export default function TechnicianBookingsScreen() {
	return (
		<Redirect
			href={{
				pathname: ROUTES.technician.schedule,
				params: { view: "bookings" },
			}}
		/>
	);
}
