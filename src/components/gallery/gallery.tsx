"use client";

import { CharacterDetails } from "@/components/character/character-details";
import { CharacterGrid } from "@/components/gallery/character-grid";
import { AppHeader } from "@/components/header/app-header";
import type { BoopOrder } from "@/components/mascot/mascot";
import { SplashScreen } from "@/components/splash/splash-screen";
import type { GalleryCharacter } from "@/data/characters";
import { useReactionSound } from "@/hooks/use-reaction-sound";
import { brand } from "@/lib/brand";
import { useCallback, useRef, useState } from "react";

export function Gallery({ characters }: { characters: readonly GalleryCharacter[] }) {
	const [boopOrder, setBoopOrder] = useState<BoopOrder>("cycle");
	const [selectedCharacter, setSelectedCharacter] = useState<GalleryCharacter | null>(null);
	const [catalogOpen, setCatalogOpen] = useState(false);
	const [openedFromCatalog, setOpenedFromCatalog] = useState(false);
	const headerLogoRef = useRef<HTMLSpanElement>(null);
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
			<a
				href="#gallery-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground focus:shadow-lg focus:outline-2 focus:outline-offset-2 focus:outline-ring focus:corner-squircle focus:squircle:rounded-2xl"
			>
				{brand.skipToGallery}
			</a>
			<SplashScreen targetRef={headerLogoRef} />
			<AppHeader
				characters={characters}
				boopOrder={boopOrder}
				onBoopOrderChange={setBoopOrder}
				soundEnabled={soundEnabled}
				onSoundToggle={toggleSound}
				catalogOpen={catalogOpen}
				onCatalogOpenChange={handleCatalogOpenChange}
				onSelectCharacter={handleSelectFromCatalog}
				logoRef={headerLogoRef}
			/>
			<main
				className="relative flex-1 overflow-hidden"
				onPointerDownCapture={resumeSound}
				onPointerUpCapture={resumeSound}
				onClickCapture={resumeSound}
			>
				<h2 id="gallery-content" tabIndex={-1} className="sr-only">
					{brand.galleryHeading}
				</h2>
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
