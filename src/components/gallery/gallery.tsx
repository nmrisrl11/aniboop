"use client";

import type { GalleryCharacter } from "@/data/characters";
import { useState } from "react";
import { CharacterGrid, type BoopOrder } from "./character-grid";
import { GalleryDock } from "./gallery-dock";

export function Gallery({ characters }: { characters: readonly GalleryCharacter[] }) {
	const [boopOrder, setBoopOrder] = useState<BoopOrder>("cycle");

	return (
		<main className="relative h-dvh overflow-hidden">
			<GalleryDock characters={characters} boopOrder={boopOrder} onBoopOrderChange={setBoopOrder} />
			<CharacterGrid characters={characters} boopOrder={boopOrder} />
		</main>
	);
}
