"use client";

import { AppHeader } from "@/components/header/app-header";
import { CharacterGrid } from "@/components/gallery/character-grid";
import type { BoopOrder } from "@/components/mascot/mascot";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { useState } from "react";

export function Gallery({ characters }: { characters: readonly GalleryCharacter[] }) {
	const [boopOrder, setBoopOrder] = useState<BoopOrder>("cycle");

	return (
		<div className="relative flex h-dvh flex-col overflow-hidden">
			<AppHeader characters={characters} boopOrder={boopOrder} onBoopOrderChange={setBoopOrder} />
			<main className="relative flex-1 overflow-hidden">
				<CharacterGrid characters={characters} boopOrder={boopOrder} />
			</main>
			<p id="grid-instructions" className="sr-only">
				{brand.galleryInstructions}
			</p>
		</div>
	);
}
