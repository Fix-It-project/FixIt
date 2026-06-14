import {
	configureReanimatedLogger,
	ReanimatedLogLevel,
} from "react-native-reanimated";

/**
 * Reanimated v4 ships `strict` logger mode ON by default. It floods the console
 * with "Reading/Writing `value` during component render" whenever a *third-party*
 * library touches a shared value during render — notably `@gorhom/bottom-sheet`
 * (animatedIndex/animatedPosition). That's library-internal code we can't change;
 * our own components are strict-clean (all `.value` access lives in worklets /
 * effects / event handlers).
 *
 * Keep the `warn` level so genuine Reanimated warnings and errors still surface,
 * but turn `strict` off to silence the library-origin noise.
 *
 * Side-effect module: imported once at the top of the root layout, before any
 * animated component mounts. Docs:
 * https://docs.swmansion.com/react-native-reanimated/docs/debugging/logger-configuration
 */
configureReanimatedLogger({
	level: ReanimatedLogLevel.warn,
	strict: false,
});
