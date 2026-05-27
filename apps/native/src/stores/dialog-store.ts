import { create } from "zustand";

export interface DialogConfig {
	title: string;
	description?: string;
	primary: { label: string; destructive?: boolean };
	secondary?: { label: string };
	dismissible?: boolean;
	icon?: unknown; // LucideIcon | ReactNode — typed loosely to avoid React import in store
}

export interface DialogEntry {
	id: string;
	config: DialogConfig;
	resolve: (result: boolean) => void;
}

interface DialogState {
	stack: DialogEntry[];
	push: (config: DialogConfig) => Promise<boolean>;
	pop: (result: boolean) => void;
	clear: () => void;
}

function generateId(): string {
	// biome-ignore lint/suspicious/noExplicitAny: crypto.randomUUID is not universally available at runtime
	const cryptoObj = typeof crypto !== "undefined" ? (crypto as any) : null;
	if (cryptoObj?.randomUUID) {
		return cryptoObj.randomUUID();
	}
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useDialogStore = create<DialogState>((set, get) => ({
	stack: [],

	push: (config: DialogConfig): Promise<boolean> => {
		return new Promise<boolean>((resolve) => {
			const entry: DialogEntry = {
				id: generateId(),
				config,
				resolve,
			};
			set((state) => ({ stack: [...state.stack, entry] }));
		});
	},

	pop: (result: boolean): void => {
		const { stack } = get();
		if (stack.length === 0) return;

		const top = stack[stack.length - 1];
		set((state) => ({ stack: state.stack.slice(0, -1) }));
		top.resolve(result);
	},

	clear: (): void => {
		const { stack } = get();
		set({ stack: [] });
		for (const entry of stack) {
			entry.resolve(false);
		}
	},
}));

/**
 * Imperative confirm() helper.
 * Pushes a dialog onto the stack and returns a Promise<boolean>
 * that resolves when the user confirms (true) or dismisses (false).
 */
export async function confirm(config: DialogConfig): Promise<boolean> {
	return useDialogStore.getState().push(config);
}
