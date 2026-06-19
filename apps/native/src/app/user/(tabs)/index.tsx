import { DeferredScreen } from "@/src/components/layout/DeferredScreen";
import { ScreenStatusBar } from "@/src/components/layout/ScreenStatusBar";
import { NewHome } from "@/src/features/newhome/NewHome";

export default function Home() {
	return (
		<>
			<ScreenStatusBar variant="blue" />
			<DeferredScreen>
				<NewHome />
			</DeferredScreen>
		</>
	);
}
