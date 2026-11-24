"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { CatalogGroup } from "./types";
import { brand } from "@/lib/brand";
import { SearchIcon, XIcon } from "lucide-react";
import { type RefObject, useId } from "react";

const copy = brand.galleryControls;

export function CatalogSearchFilter({
	searchQuery,
	onSearchChange,
	onClearSearch,
	selectedSeries,
	onSeriesChange,
	catalogGroups,
	searchRef,
}: {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	onClearSearch: () => void;
	selectedSeries: string;
	onSeriesChange: (series: string) => void;
	catalogGroups: readonly CatalogGroup[];
	searchRef: RefObject<HTMLInputElement | null>;
}) {
	const searchInputId = useId();

	return (
		<search className="shrink-0 border-b border-border px-4 pb-3 sm:px-6">
			<div className="grid gap-2 min-[500px]:grid-cols-[minmax(0,1fr)_minmax(0,10rem)] sm:grid-cols-[minmax(0,1fr)_12rem] sm:gap-3">
				<div className="relative flex items-center">
					<label htmlFor={searchInputId} className="sr-only">
						{copy.searchCatalog}
					</label>
					<SearchIcon
						aria-hidden="true"
						className="pointer-events-none absolute left-3 size-4 text-muted-foreground"
					/>
					<Input
						ref={searchRef}
						id={searchInputId}
						name="search"
						type="text"
						autoComplete="off"
						value={searchQuery}
						onChange={(event) => onSearchChange(event.target.value)}
						placeholder={copy.catalogSearchPlaceholder}
						className="h-11 px-9"
					/>
					{searchQuery && (
						<Button
							variant="ghost"
							size="icon-sm"
							onClick={onClearSearch}
							className="absolute right-1 text-muted-foreground"
							aria-label={copy.clearSearch}
						>
							<XIcon aria-hidden="true" />
						</Button>
					)}
				</div>
				<Select name="series" value={selectedSeries} onValueChange={onSeriesChange}>
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
		</search>
	);
}
