"use client";

import { CharacterGrid } from "@/components/gallery/character-grid";
import { AppHeader } from "@/components/header/app-header";
import { SplashScreen } from "@/components/splash/splash-screen";
import {
	resolveGalleryCharacters,
	type CatalogCharacter,
	type GalleryCharacter,
} from "@/data/characters";
import { useBoopOrder } from "@/hooks/use-boop-order";
import { useReactionSound } from "@/hooks/use-reaction-sound";
import { brand } from "@/lib/brand";
import { CHARACTER_QUERY_KEY, characterQueryParser } from "@/lib/search-params";
import dynamic from "next/dynamic";
import { useQueryState, type Options } from "nuqs";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

const CharacterDetails = dynamic(
	() => import("@/components/character/character-details").then((mod) => mod.CharacterDetails),
	{ ssr: false },
);

type SetCharacterQuery = (value: string | null, options?: Options) => Promise<URLSearchParams>;

function GalleryCharacterQuerySync({
	onQueryChange,
	setQueryRef,
}: {
	onQueryChange: (characterId: string | null) => void;
	setQueryRef: React.RefObject<SetCharacterQuery | null>;
}) {
	const [characterId, setCharacterId] = useQueryState(
		CHARACTER_QUERY_KEY,
		characterQueryParser.withOptions({ history: "push" }),
	);

	useEffect(() => {
		setQueryRef.current = setCharacterId;
		return () => {
			if (setQueryRef.current === setCharacterId) {
				setQueryRef.current = null;
			}
		};
	}, [setCharacterId, setQueryRef]);

	useEffect(() => {
		onQueryChange(characterId);
	}, [characterId, onQueryChange]);

	return null;
}

export function Gallery({ catalog }: { catalog: readonly CatalogCharacter[] }) {
	const characters = useMemo(() => resolveGalleryCharacters(catalog), [catalog]);
	const charactersById = useMemo(
		() => new Map(characters.map((character) => [character.id, character])),
		[characters],
	);
	const { boopOrder, setBoopOrder } = useBoopOrder();
	const [selectedCharacter, setSelectedCharacter] = useState<GalleryCharacter | null>(null);
	const [catalogOpen, setCatalogOpen] = useState(false);
	const [openedFromCatalog, setOpenedFromCatalog] = useState(false);
	const headerLogoRef = useRef<HTMLSpanElement>(null);
	const selectedCharacterIdRef = useRef<string | null>(null);
	const setCharacterQueryRef = useRef<SetCharacterQuery | null>(null);
	const { soundEnabled, toggleSound, resumeSound, playReactionSound } = useReactionSound();

	useEffect(() => {
		selectedCharacterIdRef.current = selectedCharacter?.id ?? null;
	}, [selectedCharacter]);

	const handleQueryCharacterChange = useCallback(
		(characterId: string | null) => {
			if (!characterId) {
				setSelectedCharacter(null);
				setOpenedFromCatalog(false);
				return;
			}

			const match = charactersById.get(characterId);
			if (!match) {
				setSelectedCharacter(null);
				setOpenedFromCatalog(false);
				void setCharacterQueryRef.current?.(null, { history: "replace" });
				return;
			}

			if (selectedCharacterIdRef.current !== match.id) {
				setCatalogOpen(false);
				setOpenedFromCatalog(false);
				setSelectedCharacter(match);
			}
		},
		[charactersById],
	);

	const handleSelectFromCatalog = useCallback((character: GalleryCharacter) => {
		setCatalogOpen(false);
		setOpenedFromCatalog(true);
		setSelectedCharacter(character);
		void setCharacterQueryRef.current?.(character.id, { history: "push" });
	}, []);

	const handleSelectFromGrid = useCallback((character: GalleryCharacter) => {
		setCatalogOpen(false);
		setOpenedFromCatalog(false);
		setSelectedCharacter(character);
		void setCharacterQueryRef.current?.(character.id, { history: "push" });
	}, []);

	const handleCatalogOpenChange = useCallback((open: boolean) => {
		if (open) {
			setSelectedCharacter(null);
			setOpenedFromCatalog(false);
			void setCharacterQueryRef.current?.(null, { history: "replace" });
		}
		setCatalogOpen(open);
	}, []);

	const handleBackToCatalog = useCallback(() => {
		setSelectedCharacter(null);
		setOpenedFromCatalog(false);
		setCatalogOpen(true);
		void setCharacterQueryRef.current?.(null, { history: "replace" });
	}, []);

	const handleDetailsOpenChange = useCallback((open: boolean) => {
		if (!open) {
			setSelectedCharacter(null);
			setOpenedFromCatalog(false);
			void setCharacterQueryRef.current?.(null, { history: "push" });
		}
	}, []);

	return (
		<div className="relative flex h-dvh flex-col overflow-hidden">
			<Suspense fallback={null}>
				<GalleryCharacterQuerySync
					onQueryChange={handleQueryCharacterChange}
					setQueryRef={setCharacterQueryRef}
				/>
			</Suspense>
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
			{selectedCharacter !== null && (
				<CharacterDetails
					character={selectedCharacter}
					open
					onOpenChange={handleDetailsOpenChange}
					onBackToCatalog={openedFromCatalog ? handleBackToCatalog : undefined}
				/>
			)}
			<p id="grid-instructions" className="sr-only">
				{brand.galleryInstructions}
			</p>
		</div>
	);
}
