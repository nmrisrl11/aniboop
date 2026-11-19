import { REACTIONS, type Reaction } from "@/lib/mascot-sprites";

export type Character = {
	id: string;
	name: string;
	series: string;
	payoffs?: readonly Reaction[];
};

// Catalog order is the order in which characters first appear on the spiral.
export const characters: readonly [Character, ...Character[]] = [
	{
		id: "nomer",
		name: "Nomer",
		series: "Creator Mascot",
		// Nomer's first reaction cell is neutral. Start with the grin.
		payoffs: [...REACTIONS.slice(1), REACTIONS[0]],
	},
	{ id: "edward", name: "Edward Elric", series: "Fullmetal Alchemist" },
	{ id: "asta", name: "Asta", series: "Black Clover" },
	{ id: "eren", name: "Eren Yeager", series: "Attack on Titan" },
	{ id: "lelouch", name: "Lelouch vi Britannia", series: "Code Geass" },
	{ id: "natsu", name: "Natsu Dragneel", series: "Fairy Tail" },
	{ id: "jinwoo", name: "Sung Jinwoo", series: "Solo Leveling" },
	{ id: "hinata", name: "Shoyo Hinata", series: "Haikyu!!" },
	{ id: "isagi", name: "Yoichi Isagi", series: "Blue Lock" },
	{ id: "saitama", name: "Saitama", series: "One Punch Man" },
	{ id: "kaneki", name: "Ken Kaneki", series: "Tokyo Ghoul" },
	{ id: "tanjiro", name: "Tanjiro Kamado", series: "Demon Slayer" },
	{ id: "luffy", name: "Monkey D. Luffy", series: "One Piece" },
	{ id: "naruto", name: "Naruto Uzumaki", series: "Naruto" },
	{ id: "goku", name: "Son Goku", series: "Dragon Ball Z" },
	{ id: "midoriya", name: "Izuku Midoriya (Deku)", series: "My Hero Academia" },
];

export function characterAssets(id: string) {
	const root = "/mascots";
	return {
		preview: `${root}/previews/${id}.webp`,
		directions: `${root}/sheets/${id}-directions.webp`,
		reactions: `${root}/sheets/${id}-reactions.webp`,
	};
}
