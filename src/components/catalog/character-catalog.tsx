"use client";

import { CatalogDialog } from "./catalog-dialog";
import { CatalogDrawer } from "./catalog-drawer";
import { CatalogResults } from "./catalog-results";
import { CatalogSearchFilter } from "./catalog-search-filter";
import { CatalogTrigger } from "./catalog-trigger";
import type { CharacterCatalogEntry } from "./types";
import { useCharacterCatalog } from "./use-character-catalog";
import { useMediaQuery } from "@/hooks/use-media-query";

export type { CharacterCatalogEntry } from "./types";

export function CharacterCatalog({
	characters,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	onSelectCharacter,
}: {
	characters: readonly CharacterCatalogEntry[];
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onSelectCharacter?: (character: CharacterCatalogEntry) => void;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const {
		open,
		setOpen,
		searchQuery,
		updateSearch,
		clearSearch,
		selectedSeries,
		setSelectedSeries,
		catalogGroups,
		groups,
		characterCount,
		countLabel,
		searchRef,
		resultsRef,
		resetFilters,
	} = useCharacterCatalog({
		characters,
		open: controlledOpen,
		onOpenChange: controlledOnOpenChange,
	});

	const trigger = <CatalogTrigger characterCount={characterCount} />;

	const body = (
		<>
			<CatalogSearchFilter
				searchQuery={searchQuery}
				onSearchChange={updateSearch}
				onClearSearch={clearSearch}
				selectedSeries={selectedSeries}
				onSeriesChange={setSelectedSeries}
				catalogGroups={catalogGroups}
				searchRef={searchRef}
			/>
			<CatalogResults
				groups={groups}
				resultsRef={resultsRef}
				onSelect={onSelectCharacter}
				onResetFilters={resetFilters}
			/>
		</>
	);

	if (isDesktop) {
		return (
			<CatalogDialog open={open} onOpenChange={setOpen} trigger={trigger} countLabel={countLabel}>
				{body}
			</CatalogDialog>
		);
	}

	return (
		<CatalogDrawer open={open} onOpenChange={setOpen} trigger={trigger} countLabel={countLabel}>
			{body}
		</CatalogDrawer>
	);
}
