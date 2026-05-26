import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/stores/theme-store";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
	const { preference, setPreference } = useThemeStore();

	const isDark =
		preference === "dark" ||
		(preference === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={() => setPreference(isDark ? "light" : "dark")}
			aria-label="Toggle theme"
			className="rounded-full"
		>
			{isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
		</Button>
	);
}
