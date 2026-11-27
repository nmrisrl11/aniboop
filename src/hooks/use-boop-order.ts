import type { BoopOrder } from "@/components/mascot/mascot";
import { useCallback, useSyncExternalStore } from "react";

export const BOOP_ORDER_STORAGE_KEY = "aniboop-boop-order";

const DEFAULT_BOOP_ORDER: BoopOrder = "cycle";
const boopOrderListeners = new Set<() => void>();

function isBoopOrder(value: string | null): value is BoopOrder {
	return value === "cycle" || value === "random" || value === "escalate";
}

function getBoopOrderSnapshot(): BoopOrder {
	try {
		const stored = localStorage.getItem(BOOP_ORDER_STORAGE_KEY);
		return isBoopOrder(stored) ? stored : DEFAULT_BOOP_ORDER;
	} catch {
		return DEFAULT_BOOP_ORDER;
	}
}

function getServerBoopOrderSnapshot(): BoopOrder {
	return DEFAULT_BOOP_ORDER;
}

function subscribeBoopOrder(onStoreChange: () => void) {
	boopOrderListeners.add(onStoreChange);

	const handleStorage = (event: StorageEvent) => {
		if (event.key === BOOP_ORDER_STORAGE_KEY) {
			onStoreChange();
		}
	};

	window.addEventListener("storage", handleStorage);

	return () => {
		boopOrderListeners.delete(onStoreChange);
		window.removeEventListener("storage", handleStorage);
	};
}

function notifyBoopOrderChange() {
	for (const listener of boopOrderListeners) {
		listener();
	}
}

export function useBoopOrder() {
	const boopOrder = useSyncExternalStore(
		subscribeBoopOrder,
		getBoopOrderSnapshot,
		getServerBoopOrderSnapshot,
	);

	const setBoopOrder = useCallback((next: BoopOrder) => {
		try {
			localStorage.setItem(BOOP_ORDER_STORAGE_KEY, next);
		} catch {
			// Ignore localStorage write errors.
		}

		notifyBoopOrderChange();
	}, []);

	return { boopOrder, setBoopOrder };
}
