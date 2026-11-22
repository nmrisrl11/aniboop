"use client";

import type { CatalogGroup, CharacterCatalogEntry } from "./types";
import { brand } from "@/lib/brand";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const copy = brand.galleryControls;
const SEARCH_DELAY_MS = 150;

export function useCharacterCatalog({
	characters,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: {
	characters: readonly CharacterCatalogEntry[];
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = controlledOpen !== undefined;
	const open = isControlled ? controlledOpen : internalOpen;

	const setOpen = useCallback(
		(next: boolean | ((previous: boolean) => boolean)) => {
			const value = typeof next === "function" ? next(open) : next;
			if (controlledOnOpenChange) {
				controlledOnOpenChange(value);
			} else {
				setInternalOpen(value);
			}
		},
		[open, controlledOnOpenChange],
	);

	const [searchQuery, setSearchQuery] = useState("");
	const [appliedQuery, setAppliedQuery] = useState("");
	const [selectedSeries, setSelectedSeries] = useState<string>("all");
	const searchRef = useRef<HTMLInputElement>(null);
	const resultsRef = useRef<HTMLDivElement>(null);

	// Global Command + K / Ctrl + K shortcut
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
				if (!open && e.target instanceof Element && e.target.closest('[role="dialog"]')) {
					return;
				}
				e.preventDefault();
				setOpen((previous) => !previous);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, setOpen]);

	const query = searchQuery.trim().toLowerCase();

	useEffect(() => {
		if (!open || query === appliedQuery) return;
		const timeout = setTimeout(() => setAppliedQuery(query), SEARCH_DELAY_MS);
		return () => clearTimeout(timeout);
	}, [open, query, appliedQuery]);

	useEffect(() => {
		resultsRef.current?.scrollTo(0, 0);
	}, [appliedQuery, selectedSeries]);

	const catalogGroups = useMemo(() => {
		const bySeries = new Map<string, CatalogGroup>();
		for (const character of characters) {
			let group = bySeries.get(character.series);
			if (!group) {
				group = {
					series: character.series,
					searchSeries: character.series.toLowerCase(),
					members: [],
				};
				bySeries.set(character.series, group);
			}
			group.members.push({ character, searchName: character.name.toLowerCase() });
		}
		return [...bySeries.values()].sort((a, b) => a.series.localeCompare(b.series, "en"));
	}, [characters]);

	const { groups, matchCount } = useMemo(() => {
		const groups: CatalogGroup[] = [];
		let matchCount = 0;
		for (const group of catalogGroups) {
			if (selectedSeries !== "all" && group.series !== selectedSeries) continue;

			const members =
				!appliedQuery || group.searchSeries.includes(appliedQuery)
					? group.members
					: group.members.filter(({ searchName }) => searchName.includes(appliedQuery));
			if (members.length === 0) continue;

			groups.push(members === group.members ? group : { ...group, members });
			matchCount += members.length;
		}
		return { groups, matchCount };
	}, [catalogGroups, appliedQuery, selectedSeries]);

	const characterCount = characters.length;
	const countLabel =
		appliedQuery || selectedSeries !== "all"
			? copy.matchCount(matchCount)
			: copy.characterCount(characterCount);

	const updateSearch = useCallback((value: string) => {
		setSearchQuery(value);
		if (!value.trim()) setAppliedQuery("");
	}, []);

	const clearSearch = useCallback(() => {
		updateSearch("");
		searchRef.current?.focus();
	}, [updateSearch]);

	const resetFilters = useCallback(() => {
		clearSearch();
		setSelectedSeries("all");
	}, [clearSearch]);

	return {
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
	};
}
