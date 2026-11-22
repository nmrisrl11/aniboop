"use client";

import { AppHeader } from "@/components/header/app-header";
import { CharacterGrid } from "@/components/gallery/character-grid";
import type { BoopOrder } from "@/components/mascot/mascot";
import type { GalleryCharacter } from "@/data/characters";
import { useReactionSound } from "@/hooks/use-reaction-sound";
import { brand } from "@/lib/brand";
import { useState } from "react";

export function Gallery({ characters }: { characters: readonly GalleryCharacter[] }) {
	const [boopOrder, setBoopOrder] = useState<BoopOrder>("cycle");
	const { soundEnabled, toggleSound, resumeSound, playReactionSound } = useReactionSound();

	return (
		<div className="relative flex h-dvh flex-col overflow-hidden">
			<AppHeader
				characters={characters}
				boopOrder={boopOrder}
				onBoopOrderChange={setBoopOrder}
				soundEnabled={soundEnabled}
				onSoundToggle={toggleSound}
			/>
			<main
				className="relative flex-1 overflow-hidden"
				onPointerDownCapture={resumeSound}
				onPointerUpCapture={resumeSound}
				onClickCapture={resumeSound}
			>
				<h2 className="sr-only">{brand.galleryHeading}</h2>
				<CharacterGrid characters={characters} boopOrder={boopOrder} onReact={playReactionSound} />
			</main>
			<p id="grid-instructions" className="sr-only">
				{brand.galleryInstructions}
			</p>
		</div>
	);
}
