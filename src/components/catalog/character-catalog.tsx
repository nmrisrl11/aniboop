"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { ChevronRight, Library, Search, X } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

const copy = brand.galleryControls;
const SEARCH_DELAY_MS = 150;

export type CharacterCatalogEntry = GalleryCharacter;
type CatalogGroup = {
	series: string;
	searchSeries: string;
	members: { character: CharacterCatalogEntry; searchName: string }[];
};

const CatalogResults = memo(function CatalogResults({
	groups,
	onSelect,
}: {
	groups: CatalogGroup[];
	onSelect?: (character: CharacterCatalogEntry) => void;
}) {
	return (
		<div className="flex flex-col gap-5 sm:gap-6">
			{groups.map(({ series, members }) => (
				<section key={series} className="flex flex-col gap-2.5">
					<h3 className="flex items-baseline justify-between gap-3 border-b border-border pb-2 text-sm font-semibold">
						{series}
						<span className="font-mono text-xs font-normal text-muted-foreground tabular-nums">
							{members.length}
						</span>
					</h3>
					<ul role="list" className="grid gap-2 min-[420px]:grid-cols-2 sm:grid-cols-3">
						{members.map(({ character }) => {
							const { id, name, series: charSeries, preview } = character;
							return (
								<li key={id}>
									<button
										type="button"
										onClick={() => onSelect?.(character)}
										className="group flex w-full min-w-0 items-center justify-between gap-2.5 rounded-xl bg-muted/60 p-2 text-left transition-all duration-160 ease-out corner-squircle hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98]"
										aria-label={`${brand.characterDetails.viewAndDownload}: ${name}`}
										title={`${brand.characterDetails.viewAndDownload}: ${name}`}
									>
										<div className="flex min-w-0 items-center gap-2.5">
											<Image
												src={preview}
												alt={copy.portraitAlt(name)}
												title={copy.portraitTitle(name, charSeries)}
												width={36}
												height={36}
												unoptimized
												className="shrink-0 rounded-lg bg-card transition-transform duration-160 ease-out corner-squircle group-hover:scale-105"
											/>
											<span className="truncate text-sm font-semibold transition-colors group-hover:text-primary">
												{name}
											</span>
										</div>
										<ChevronRight
											className="size-4 shrink-0 text-muted-foreground/40 transition-all duration-160 ease-out group-hover:translate-x-0.5 group-hover:text-foreground"
											aria-hidden="true"
										/>
									</button>
								</li>
							);
						})}
					</ul>
				</section>
			))}
		</div>
	);
});

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
	const returnFocusRef = useRef<HTMLElement | null>(null);

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

	function updateSearch(value: string) {
		setSearchQuery(value);
		if (!value.trim()) setAppliedQuery("");
	}

	function clearSearch() {
		updateSearch("");
		searchRef.current?.focus();
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="secondary"
					size="sm"
					className="h-11 gap-2 rounded-xl px-3.5 text-sm font-semibold md:h-8 md:rounded-lg md:px-2.5 md:text-xs"
					aria-label={`${copy.catalog}, ${copy.characterCount(characterCount)}`}
					aria-keyshortcuts="Control+K Meta+K"
					title={copy.catalog}
				>
					<Library data-icon="inline-start" aria-hidden="true" />
					{copy.catalog}
					<span className="hidden h-5 min-w-5 place-items-center rounded-full bg-card px-1.5 text-[10px] font-bold text-foreground tabular-nums shadow-xs md:grid">
						{characterCount}
					</span>
				</Button>
			</DialogTrigger>

			<DialogContent
				className="h-168 max-w-3xl"
				onOpenAutoFocus={() => {
					const active = document.activeElement;
					returnFocusRef.current =
						active instanceof HTMLElement && active !== document.body ? active : null;
				}}
				onCloseAutoFocus={(event) => {
					const opener = returnFocusRef.current;
					returnFocusRef.current = null;
					if (!opener?.isConnected) return;
					event.preventDefault();
					opener.focus();
				}}
			>
				<DialogHeader>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
						<DialogTitle>{copy.catalog}</DialogTitle>
						<span
							role="status"
							className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground tabular-nums"
						>
							{countLabel}
						</span>
					</div>
					<DialogDescription>{copy.catalogDescription}</DialogDescription>
				</DialogHeader>

				<div className="shrink-0 border-b border-border px-4 pb-3 sm:px-6">
					<div className="grid gap-2 min-[500px]:grid-cols-[minmax(0,1fr)_minmax(0,10rem)] sm:grid-cols-[minmax(0,1fr)_12rem] sm:gap-3">
						<div className="relative flex items-center">
							<Search
								aria-hidden="true"
								className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
							/>
							<Input
								ref={searchRef}
								type="text"
								aria-label={copy.searchCatalog}
								value={searchQuery}
								onChange={(event) => updateSearch(event.target.value)}
								placeholder={copy.catalogSearchPlaceholder}
								className="h-11 px-9"
							/>
							{searchQuery && (
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={clearSearch}
									className="absolute right-1 text-muted-foreground"
									aria-label={copy.clearSearch}
								>
									<X aria-hidden="true" />
								</Button>
							)}
						</div>
						<Select value={selectedSeries} onValueChange={setSelectedSeries}>
							<SelectTrigger
								aria-label={copy.filterSeries}
								className="w-full min-w-0 data-[size=default]:h-11 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent
								position="popper"
								align="end"
								sideOffset={4}
								collisionPadding={12}
								className="max-w-(--radix-select-content-available-width) motion-reduce:animate-none"
							>
								<SelectGroup>
									<SelectItem value="all">{copy.allSeries}</SelectItem>
									{catalogGroups.map(({ series, members }) => (
										<SelectItem key={series} value={series}>
											{series} ({members.length})
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div
					ref={resultsRef}
					role="region"
					aria-label={copy.catalogResults}
					tabIndex={0}
					className="catalog-scrollbar min-h-0 flex-1 scrollbar-gutter-stable overflow-y-auto overscroll-contain px-4 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-6 sm:py-5"
				>
					{groups.length === 0 ? (
						<div className="flex min-h-36 flex-col items-center justify-center gap-2 py-4 text-center">
							<p className="text-sm font-semibold">{copy.noCatalogResults}</p>
							<p className="text-sm text-muted-foreground">{copy.catalogSearchHint}</p>
							<Button
								variant="outline"
								onClick={() => {
									clearSearch();
									setSelectedSeries("all");
								}}
								className="mt-1"
							>
								{copy.resetSearch}
							</Button>
						</div>
					) : (
						<CatalogResults groups={groups} onSelect={onSelectCharacter} />
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
