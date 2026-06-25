import {
	SafeAreaView as NativeSafeAreaView,
	type SafeAreaViewProps,
} from "react-native-safe-area-context";

const DEFAULT_EDGES = ["top"] as const;

export function ScreenSafeAreaView({
	edges = DEFAULT_EDGES,
	className = "flex-1",
	...props
}: Readonly<SafeAreaViewProps>) {
	return <NativeSafeAreaView edges={edges} className={className} {...props} />;
}
