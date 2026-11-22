import type { GalleryCharacter } from "@/data/characters";

export type CharacterCatalogEntry = GalleryCharacter;

export type CatalogGroup = {
	series: string;
	searchSeries: string;
	members: { character: CharacterCatalogEntry; searchName: string }[];
};
