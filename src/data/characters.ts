import { getGalleryAssetUrls } from "@/lib/assets";
import catalog from "./characters.json";

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
