import { useEffect, useState } from "react";
import { InteractionManager } from "react-native";

// Defers heavy content until the current navigation transition / interactions
// settle. Render a lightweight shell or skeleton while this returns `false`, then
// the expensive subtree once it flips to `true` — so a tab switch / push commits
// instantly instead of waiting on the destination's first render.
//
// `InteractionManager` is deprecated in RN 0.85, but it remains the right tool for
// a one-shot, cancellable mount deferral; chunked long work should use
// `requestIdleCallback` instead.
export function useDeferredMount(): boolean {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		const handle = InteractionManager.runAfterInteractions(() => {
			setReady(true);
		});
		// Cancel on fast unmount so we never setState on a dead screen.
		return () => handle.cancel();
	}, []);

	return ready;
}
