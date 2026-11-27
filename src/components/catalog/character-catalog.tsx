"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { CatalogTrigger } from "./catalog-trigger";
import type { CharacterCatalogEntry } from "./types";
import { useCharacterCatalog } from "./use-character-catalog";

export type { CharacterCatalogEntry } from "./types";

const CatalogDialog = dynamic(() => import("./catalog-dialog").then((mod) => mod.CatalogDialog), {
	ssr: false,
});
const CatalogDrawer = dynamic(() => import("./catalog-drawer").then((mod) => mod.CatalogDrawer), {
	ssr: false,
});
const CatalogResults = dynamic(
	() => import("./catalog-results").then((mod) => mod.CatalogResults),
	{ ssr: false },
);
const CatalogSearchFilter = dynamic(
	() => import("./catalog-search-filter").then((mod) => mod.CatalogSearchFilter),
	{ ssr: false },
);

export function CharacterCatalog({
	characters,
	favoriteIds,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	onSelectCharacter,
	hideTrigger = false,
	actionLabel,
}: {
	characters: readonly CharacterCatalogEntry[];
	favoriteIds?: ReadonlySet<string>;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSelectCharacter?: (character: CharacterCatalogEntry) => void;
	hideTrigger?: boolean;
	actionLabel?: string;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [hasOpened, setHasOpened] = useState(false);
	const {
		open,
		setOpen,
		searchQuery,
		updateSearch,
		clearSearch,
		selectedSeries,
		setSelectedSeries,
		favoriteCount,
		catalogGroups,
		groups,
		characterCount,
		countLabel,
		searchRef,
		resultsRef,
		resetFilters,
	} = useCharacterCatalog({
		characters,
		favoriteIds,
		open: controlledOpen,
		onOpenChange: controlledOnOpenChange,
	});

	if (open && !hasOpened) {
		setHasOpened(true);
	}

	const shouldMountSurface = open || hasOpened;

	const body = shouldMountSurface ? (
		<>
			<CatalogSearchFilter
				searchQuery={searchQuery}
				onSearchChange={updateSearch}
				onClearSearch={clearSearch}
				selectedSeries={selectedSeries}
				onSeriesChange={setSelectedSeries}
				favoriteCount={favoriteCount}
				catalogGroups={catalogGroups}
				searchRef={searchRef}
			/>
			<CatalogResults
				groups={groups}
				resultsRef={resultsRef}
				onSelect={onSelectCharacter}
				onResetFilters={resetFilters}
				actionLabel={actionLabel}
			/>
		</>
	) : null;

	return (
		<>
			{!hideTrigger && (
				<CatalogTrigger
					characterCount={characterCount}
					aria-haspopup="dialog"
					aria-expanded={open}
					onClick={() => setOpen(true)}
				/>
			)}
			{shouldMountSurface &&
				(isDesktop ? (
					<CatalogDialog open={open} onOpenChange={setOpen} countLabel={countLabel}>
						{body}
					</CatalogDialog>
				) : (
					<CatalogDrawer open={open} onOpenChange={setOpen} countLabel={countLabel}>
						{body}
					</CatalogDrawer>
				))}
		</>
	);
}
