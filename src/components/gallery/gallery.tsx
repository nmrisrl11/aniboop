"use client";

import { CharacterDetails } from "@/components/character/character-details";
import { CharacterGrid } from "@/components/gallery/character-grid";
import { AppHeader } from "@/components/header/app-header";
import type { BoopOrder } from "@/components/mascot/mascot";
import type { GalleryCharacter } from "@/data/characters";
import { useReactionSound } from "@/hooks/use-reaction-sound";
import { brand } from "@/lib/brand";
import { useCallback, useState } from "react";

export function Gallery({ characters }: { characters: readonly GalleryCharacter[] }) {
	const [boopOrder, setBoopOrder] = useState<BoopOrder>("cycle");
	const [selectedCharacter, setSelectedCharacter] = useState<GalleryCharacter | null>(null);
	const [catalogOpen, setCatalogOpen] = useState(false);
	const [openedFromCatalog, setOpenedFromCatalog] = useState(false);
	const { soundEnabled, toggleSound, resumeSound, playReactionSound } = useReactionSound();

	const handleSelectFromCatalog = useCallback((character: GalleryCharacter) => {
		setCatalogOpen(false);
		setOpenedFromCatalog(true);
		setSelectedCharacter(character);
	}, []);

	const handleSelectFromGrid = useCallback((character: GalleryCharacter) => {
		setCatalogOpen(false);
		setOpenedFromCatalog(false);
		setSelectedCharacter(character);
	}, []);

	const handleCatalogOpenChange = useCallback((open: boolean) => {
		if (open) {
			setSelectedCharacter(null);
			setOpenedFromCatalog(false);
		}
		setCatalogOpen(open);
	}, []);

	const handleBackToCatalog = useCallback(() => {
		setSelectedCharacter(null);
		setOpenedFromCatalog(false);
		setCatalogOpen(true);
	}, []);

	const handleDetailsOpenChange = useCallback((open: boolean) => {
		if (!open) {
			setSelectedCharacter(null);
			setOpenedFromCatalog(false);
		}
	}, []);

	return (
		<div className="relative flex h-dvh flex-col overflow-hidden">
			<AppHeader
				characters={characters}
				boopOrder={boopOrder}
				onBoopOrderChange={setBoopOrder}
				soundEnabled={soundEnabled}
				onSoundToggle={toggleSound}
				catalogOpen={catalogOpen}
				onCatalogOpenChange={handleCatalogOpenChange}
				onSelectCharacter={handleSelectFromCatalog}
			/>
			<main
				className="relative flex-1 overflow-hidden"
				onPointerDownCapture={resumeSound}
				onPointerUpCapture={resumeSound}
				onClickCapture={resumeSound}
			>
				<h2 className="sr-only">{brand.galleryHeading}</h2>
				<CharacterGrid
					characters={characters}
					boopOrder={boopOrder}
					onReact={playReactionSound}
					onSelectCharacter={handleSelectFromGrid}
				/>
			</main>
			<CharacterDetails
				character={selectedCharacter}
				open={selectedCharacter !== null}
				onOpenChange={handleDetailsOpenChange}
				onBackToCatalog={openedFromCatalog ? handleBackToCatalog : undefined}
			/>
			<p id="grid-instructions" className="sr-only">
				{brand.galleryInstructions}
			</p>
		</div>
	);
}
