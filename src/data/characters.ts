import { REACTIONS, type Reaction } from "@/lib/mascot-sprites";
import type { StaticImageData } from "next/image";
import catalog from "./characters.json";

export type GalleryCharacter = {
	id: string;
	name: string;
	series: string;
	payoffs?: readonly Reaction[];
	preview: string;
	galleryDirections: string;
	reactions: string;
};

// Nomer's first reaction cell is neutral. Start with the grin.
const nomerPayoffs = [...REACTIONS.slice(1), REACTIONS[0]];

export function getGalleryCharacters(): Promise<GalleryCharacter[]> {
	return Promise.all(
		catalog.map(async (character) => {
			const { id } = character;
			// Resolve the content-hashed assets at build time and send only their URLs to the grid.
			const [preview, galleryDirections, reactions]: { default: StaticImageData }[] =
				await Promise.all([
					import(`../../public/mascots/previews/${id}.webp`),
					import(`../../public/mascots/previews/${id}-directions.webp`),
					import(`../../public/mascots/sheets/${id}-reactions.webp`),
				]);
			return {
				...character,
				payoffs: id === "nomer" ? nomerPayoffs : undefined,
				preview: preview.default.src,
				galleryDirections: galleryDirections.default.src,
				reactions: reactions.default.src,
			};
		}),
	);
}
