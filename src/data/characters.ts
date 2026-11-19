import { REACTIONS, type Reaction } from "@/lib/mascot-sprites";
import catalog from "./characters.json";

export type Character = {
	id: string;
	name: string;
	series: string;
	payoffs?: readonly Reaction[];
};

// Nomer's first reaction cell is neutral. Start with the grin.
const nomerPayoffs = [...REACTIONS.slice(1), REACTIONS[0]];

export const characters: readonly Character[] = catalog.map((character) =>
	character.id === "nomer" ? { ...character, payoffs: nomerPayoffs } : character,
);

export function characterAssets(id: string) {
	const root = "/mascots";
	return {
		preview: `${root}/previews/${id}.webp`,
		directions: `${root}/sheets/${id}-directions.webp`,
		reactions: `${root}/sheets/${id}-reactions.webp`,
	};
}
