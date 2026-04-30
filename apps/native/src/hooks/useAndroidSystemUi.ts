import { useEffect } from "react";
import { setAndroidNavigationBar } from "@/src/lib/android-navigation-bar";

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
