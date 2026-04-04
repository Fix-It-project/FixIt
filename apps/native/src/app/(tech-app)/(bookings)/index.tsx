import { Redirect } from "expo-router";

/** Redirects the bookings root to the unified Schedule surface in bookings mode. */
export default function BookingsRedirect() {
  return <Redirect href="/(tech-app)/(schedule)?view=bookings" />;
}
