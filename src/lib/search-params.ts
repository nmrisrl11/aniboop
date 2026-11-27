import { parseAsString } from "nuqs";

export const CHARACTER_QUERY_KEY = "character";

export const characterQueryParser = parseAsString.withOptions({
	shallow: true,
	clearOnDefault: true,
});

export function getCharacterSharePath(id: string): string {
	return `/?${CHARACTER_QUERY_KEY}=${encodeURIComponent(id)}`;
}

export function getPlaygroundCharacterPath(id: string): string {
	return `/playground?${CHARACTER_QUERY_KEY}=${encodeURIComponent(id)}`;
}
