import { useCallback, useSyncExternalStore } from "react";

export const FAVORITES_STORAGE_KEY = "aniboop-favorites";

const EMPTY_FAVORITES: ReadonlySet<string> = new Set();
const favoritesListeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cachedSet: ReadonlySet<string> = EMPTY_FAVORITES;

function parseFavorites(raw: string | null): ReadonlySet<string> {
	if (!raw) return EMPTY_FAVORITES;
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return EMPTY_FAVORITES;
		const valid = parsed.filter(
			(item): item is string => typeof item === "string" && item.length > 0,
		);
		return valid.length > 0 ? new Set(valid) : EMPTY_FAVORITES;
	} catch {
		return EMPTY_FAVORITES;
	}
}

function getFavoritesSnapshot(): ReadonlySet<string> {
	try {
		const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
		if (raw === cachedRaw) return cachedSet;
		cachedRaw = raw;
		cachedSet = parseFavorites(raw);
		return cachedSet;
	} catch {
		return EMPTY_FAVORITES;
	}
}

function getServerFavoritesSnapshot(): ReadonlySet<string> {
	return EMPTY_FAVORITES;
}

function subscribeFavorites(onStoreChange: () => void) {
	favoritesListeners.add(onStoreChange);

	const handleStorage = (event: StorageEvent) => {
		if (event.key === FAVORITES_STORAGE_KEY) {
			onStoreChange();
		}
	};

	window.addEventListener("storage", handleStorage);

	return () => {
		favoritesListeners.delete(onStoreChange);
		window.removeEventListener("storage", handleStorage);
	};
}

function notifyFavoritesChange() {
	for (const listener of favoritesListeners) {
		listener();
	}
}

export function useFavorites() {
	const favoriteIds = useSyncExternalStore(
		subscribeFavorites,
		getFavoritesSnapshot,
		getServerFavoritesSnapshot,
	);

	const toggleFavorite = useCallback((id: string) => {
		const current = getFavoritesSnapshot();
		const next = new Set(current);
		if (next.has(id)) {
			next.delete(id);
		} else {
			next.add(id);
		}

		const serialized = next.size > 0 ? JSON.stringify([...next]) : null;
		cachedRaw = serialized;
		cachedSet = next.size > 0 ? next : EMPTY_FAVORITES;

		try {
			if (serialized === null) {
				localStorage.removeItem(FAVORITES_STORAGE_KEY);
			} else {
				localStorage.setItem(FAVORITES_STORAGE_KEY, serialized);
			}
		} catch {
			// Ignore localStorage write errors.
		}

		notifyFavoritesChange();
	}, []);

	return { favoriteIds, toggleFavorite };
}
