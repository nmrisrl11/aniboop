"use client";

import { CharacterGrid } from "@/components/gallery/character-grid";
import { GalleryDock } from "@/components/gallery/gallery-dock";
import { AppHeader } from "@/components/header/app-header";
import { SplashScreen } from "@/components/splash/splash-screen";
import {
	resolveGalleryCharacters,
	type CatalogCharacter,
	type GalleryCharacter,
} from "@/data/characters";
import { useBoopOrder } from "@/hooks/use-boop-order";
import { useFavorites } from "@/hooks/use-favorites";
import { useReactionSound } from "@/hooks/use-reaction-sound";
import { brand } from "@/lib/brand";
import {
	CHARACTER_QUERY_KEY,
	SERIES_QUERY_KEY,
	characterQueryParser,
	seriesQueryParser,
} from "@/lib/search-params";
import { buildSeriesOptions } from "@/lib/series";
import dynamic from "next/dynamic";
import { useQueryState, type Options } from "nuqs";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

const CharacterDetails = dynamic(
	() => import("@/components/character/character-details").then((mod) => mod.CharacterDetails),
	{ ssr: false },
);

type SetQueryValue = (value: string | null, options?: Options) => Promise<URLSearchParams>;

function GalleryQuerySync({
	onCharacterChange,
	onSeriesChange,
	setCharacterQueryRef,
	setSeriesQueryRef,
}: {
	onCharacterChange: (characterId: string | null) => void;
	onSeriesChange: (seriesSlug: string | null) => void;
	setCharacterQueryRef: React.RefObject<SetQueryValue | null>;
	setSeriesQueryRef: React.RefObject<SetQueryValue | null>;
}) {
	const [characterId, setCharacterId] = useQueryState(
		CHARACTER_QUERY_KEY,
		characterQueryParser.withOptions({ history: "push" }),
	);
	const [seriesSlug, setSeriesSlug] = useQueryState(
		SERIES_QUERY_KEY,
		seriesQueryParser.withOptions({ history: "push" }),
	);

	useEffect(() => {
		setCharacterQueryRef.current = setCharacterId;
		return () => {
			if (setCharacterQueryRef.current === setCharacterId) {
				setCharacterQueryRef.current = null;
			}
		};
	}, [setCharacterId, setCharacterQueryRef]);

	useEffect(() => {
		setSeriesQueryRef.current = setSeriesSlug;
		return () => {
			if (setSeriesQueryRef.current === setSeriesSlug) {
				setSeriesQueryRef.current = null;
			}
		};
	}, [setSeriesSlug, setSeriesQueryRef]);

	useEffect(() => {
		onCharacterChange(characterId);
	}, [characterId, onCharacterChange]);

	useEffect(() => {
		onSeriesChange(seriesSlug);
	}, [seriesSlug, onSeriesChange]);

	return null;
}

export function Gallery({ catalog }: { catalog: readonly CatalogCharacter[] }) {
	const characters = useMemo(() => resolveGalleryCharacters(catalog), [catalog]);
	const charactersById = useMemo(
		() => new Map(characters.map((character) => [character.id, character])),
		[characters],
	);
	const seriesOptions = useMemo(() => buildSeriesOptions(characters), [characters]);
	const seriesBySlug = useMemo(
		() => new Map(seriesOptions.map((option) => [option.slug, option])),
		[seriesOptions],
	);
	const { boopOrder, setBoopOrder } = useBoopOrder();
	const { favoriteIds, toggleFavorite } = useFavorites();
	const [selectedCharacter, setSelectedCharacter] = useState<GalleryCharacter | null>(null);
	const [selectedSeriesSlug, setSelectedSeriesSlug] = useState<string | null>(null);
	const [favoritesOnly, setFavoritesOnly] = useState(false);
	const [catalogOpen, setCatalogOpen] = useState(false);
	const [openedFromCatalog, setOpenedFromCatalog] = useState(false);
	const headerLogoRef = useRef<HTMLSpanElement>(null);
	const selectedCharacterIdRef = useRef<string | null>(null);
	const lastRandomIdRef = useRef<string | null>(null);
	const setCharacterQueryRef = useRef<SetQueryValue | null>(null);
	const setSeriesQueryRef = useRef<SetQueryValue | null>(null);
	const { soundEnabled, toggleSound, resumeSound, playReactionSound } = useReactionSound();

	useEffect(() => {
		selectedCharacterIdRef.current = selectedCharacter?.id ?? null;
	}, [selectedCharacter]);

	const favoriteCharacters = useMemo(() => {
		if (favoriteIds.size === 0) return [];
		return characters.filter((character) => favoriteIds.has(character.id));
	}, [characters, favoriteIds]);
	const favoriteCount = favoriteCharacters.length;
	const activeFavoritesOnly = favoritesOnly && favoriteCount > 0;

	const selectedSeries =
		!activeFavoritesOnly && selectedSeriesSlug
			? (seriesBySlug.get(selectedSeriesSlug) ?? null)
			: null;
	const visibleCharacters = useMemo(() => {
		if (activeFavoritesOnly) return favoriteCharacters;
		if (!selectedSeries) return characters;
		return characters.filter((character) => character.series === selectedSeries.series);
	}, [activeFavoritesOnly, favoriteCharacters, characters, selectedSeries]);

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

	const handleQuerySeriesChange = useCallback(
		(seriesSlug: string | null) => {
			if (!seriesSlug) {
				setSelectedSeriesSlug(null);
				return;
			}

			if (!seriesBySlug.has(seriesSlug)) {
				setSelectedSeriesSlug(null);
				void setSeriesQueryRef.current?.(null, { history: "replace" });
				return;
			}

			setFavoritesOnly(false);
			setSelectedSeriesSlug(seriesSlug);
		},
		[seriesBySlug],
	);

	const handleSeriesChange = useCallback((seriesSlug: string | null) => {
		setFavoritesOnly(false);
		setSelectedSeriesSlug(seriesSlug);
		void setSeriesQueryRef.current?.(seriesSlug, { history: "push" });
	}, []);

	const handleFavoritesToggle = useCallback(() => {
		const next = !activeFavoritesOnly;
		setFavoritesOnly(next);
		if (next) {
			setSelectedSeriesSlug(null);
			void setSeriesQueryRef.current?.(null, { history: "replace" });
		}
	}, [activeFavoritesOnly]);

	const handleToggleFavorite = useCallback(
		(id: string) => {
			if (favoritesOnly && favoriteIds.has(id) && favoriteCount <= 1) {
				setFavoritesOnly(false);
			}
			toggleFavorite(id);
		},
		[favoritesOnly, favoriteIds, favoriteCount, toggleFavorite],
	);

	const handleSurpriseMe = useCallback(() => {
		const count = visibleCharacters.length;
		if (count === 0) return;

		const avoidId = selectedCharacterIdRef.current ?? lastRandomIdRef.current;
		let index = Math.floor(Math.random() * count);
		if (count > 1 && visibleCharacters[index].id === avoidId) {
			index = (index + 1) % count;
		}

		const pick = visibleCharacters[index];
		const isReroll = selectedCharacterIdRef.current !== null;
		lastRandomIdRef.current = pick.id;
		setCatalogOpen(false);
		setOpenedFromCatalog(false);
		setSelectedCharacter(pick);
		void setCharacterQueryRef.current?.(pick.id, { history: isReroll ? "replace" : "push" });
	}, [visibleCharacters]);

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
				<GalleryQuerySync
					onCharacterChange={handleQueryCharacterChange}
					onSeriesChange={handleQuerySeriesChange}
					setCharacterQueryRef={setCharacterQueryRef}
					setSeriesQueryRef={setSeriesQueryRef}
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
				favoriteIds={favoriteIds}
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
					key={activeFavoritesOnly ? "favorites" : (selectedSeries?.slug ?? "all")}
					characters={visibleCharacters}
					boopOrder={boopOrder}
					favoriteIds={favoriteIds}
					onReact={playReactionSound}
					onSelectCharacter={handleSelectFromGrid}
					onToggleFavorite={handleToggleFavorite}
				/>
				<GalleryDock
					seriesOptions={seriesOptions}
					totalCount={characters.length}
					selectedSeriesSlug={selectedSeries?.slug ?? null}
					onSeriesChange={handleSeriesChange}
					favoriteCount={favoriteCount}
					favoritesOnly={activeFavoritesOnly}
					onFavoritesToggle={handleFavoritesToggle}
					onSurpriseMe={handleSurpriseMe}
				/>
			</main>
			{selectedCharacter !== null && (
				<CharacterDetails
					character={selectedCharacter}
					open
					onOpenChange={handleDetailsOpenChange}
					onBackToCatalog={openedFromCatalog ? handleBackToCatalog : undefined}
					isFavorite={favoriteIds.has(selectedCharacter.id)}
					onToggleFavorite={() => handleToggleFavorite(selectedCharacter.id)}
					onSurpriseMe={visibleCharacters.length > 1 ? handleSurpriseMe : undefined}
				/>
			)}
			<p id="grid-instructions" className="sr-only">
				{brand.galleryInstructions}
			</p>
		</div>
	);
}
