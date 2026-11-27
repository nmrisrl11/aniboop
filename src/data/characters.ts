import { getGalleryAssetUrls } from "@/lib/assets";
import { SERIES_CATALOGS, type SeriesCatalog } from "./characters/index";

export type CatalogCharacter = {
	id: string;
	name: string;
	series: string;
	v?: string;
};

export type GalleryCharacter = CatalogCharacter & {
	preview: string;
	galleryDirections: string;
	reactions: string;
};

function interleaveSeriesCatalogs(groups: readonly SeriesCatalog[]): CatalogCharacter[] {
	const result: CatalogCharacter[] = [];
	const maxLength = Math.max(0, ...groups.map((group) => group.characters.length));

	for (let index = 0; index < maxLength; index++) {
		for (const group of groups) {
			const character = group.characters[index];
			if (character) {
				result.push({
					...character,
					series: group.series,
				});
			}
		}
	}

	return result;
}

const catalog: readonly CatalogCharacter[] = interleaveSeriesCatalogs(SERIES_CATALOGS);

export function getCatalogCharacters(): readonly CatalogCharacter[] {
	return catalog;
}

export function resolveGalleryCharacters(entries: readonly CatalogCharacter[]): GalleryCharacter[] {
	return entries.map((character) => ({
		...character,
		...getGalleryAssetUrls(character.id, character.v),
	}));
}

export function getGalleryCharacters(): GalleryCharacter[] {
	return resolveGalleryCharacters(catalog);
}
