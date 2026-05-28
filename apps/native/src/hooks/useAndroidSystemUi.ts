import { useEffect } from "react";
import { setAndroidNavigationBar } from "@/src/components/layout/android-navigation-bar";

export function useAndroidSystemUi(
	navigationBarStyle: "light" | "dark",
	enabled = true,
) {
	useEffect(() => {
		if (!enabled) {
			return;
		}

		void setAndroidNavigationBar(navigationBarStyle);
	}, [enabled, navigationBarStyle]);
}
