"use client";

import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { brand } from "@/lib/brand";
import type { SeriesOption } from "@/lib/series";
import { cn } from "@/lib/utils";
import { DicesIcon, HeartIcon, ListFilterIcon, XIcon } from "lucide-react";

const copy = brand.galleryControls;

export function GalleryDock({
	seriesOptions,
	totalCount,
	selectedSeriesSlug,
	onSeriesChange,
	favoriteCount,
	favoritesOnly,
	onFavoritesToggle,
	onSurpriseMe,
}: {
	seriesOptions: readonly SeriesOption[];
	totalCount: number;
	selectedSeriesSlug: string | null;
	onSeriesChange: (slug: string | null) => void;
	favoriteCount: number;
	favoritesOnly: boolean;
	onFavoritesToggle: () => void;
	onSurpriseMe: () => void;
}) {
	const isFiltered = selectedSeriesSlug !== null;
	const hasFavorites = favoriteCount > 0;

	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-5 z-10 flex justify-center px-4 sm:bottom-6">
			<div className="pointer-events-auto flex max-w-full items-center gap-1 rounded-xl border border-foreground/12 bg-popover p-1.5 shadow-xl ring-1 shadow-black/15 ring-black/5 corner-squircle dark:border-white/14 dark:shadow-black/60 dark:ring-white/6 squircle:rounded-3xl">
				<Select
					value={selectedSeriesSlug ?? "all"}
					onValueChange={(value) => onSeriesChange(value === "all" ? null : value)}
				>
					<SelectTrigger
						aria-label={copy.filterSeries}
						className="h-9 max-w-[min(14.5rem,calc(100vw-11rem))] min-w-0 gap-2 rounded-lg border-transparent bg-transparent pr-2.5 pl-1.5 text-xs font-medium text-foreground transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-muted active:scale-[0.98] data-[size=default]:h-9 *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:truncate motion-reduce:transition-none motion-reduce:active:scale-100 dark:bg-transparent dark:hover:bg-muted squircle:rounded-xl"
					>
						<span
							aria-hidden="true"
							className={cn(
								"flex size-6 shrink-0 items-center justify-center rounded-md transition-colors duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] corner-squircle motion-reduce:transition-none squircle:rounded-full",
								isFiltered
									? "bg-primary text-primary-foreground"
									: "bg-primary/12 text-primary dark:bg-primary/18",
							)}
						>
							<ListFilterIcon className="size-3.5" />
						</span>
						<SelectValue />
					</SelectTrigger>
					<SelectContent
						position="popper"
						side="top"
						align="center"
						sideOffset={10}
						collisionPadding={12}
						className="max-h-72 min-w-56 motion-reduce:animate-none"
					>
						<SelectGroup>
							<SelectItem value="all">
								{copy.allSeries} ({totalCount})
							</SelectItem>
							{seriesOptions.map(({ slug, series, count }) => (
								<SelectItem key={slug} value={slug}>
									{series} ({count})
								</SelectItem>
							))}
						</SelectGroup>
					</SelectContent>
				</Select>
				{isFiltered && (
					<Button
						type="button"
						variant="ghost"
						size="icon"
						onClick={() => onSeriesChange(null)}
						aria-label={copy.clearSeriesFilter}
						title={copy.clearSeriesFilter}
						className="size-9 rounded-lg text-muted-foreground transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.95] motion-reduce:transition-none motion-reduce:active:scale-100 squircle:rounded-xl"
					>
						<XIcon className="size-3.5" aria-hidden="true" />
					</Button>
				)}
				<div aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-border" />
				<Button
					type="button"
					variant="ghost"
					aria-pressed={favoritesOnly}
					disabled={!hasFavorites && !favoritesOnly}
					onClick={onFavoritesToggle}
					title={hasFavorites ? copy.favorites : copy.noFavoritesHint}
					className={cn(
						"h-9 gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 squircle:rounded-xl",
						favoritesOnly
							? "bg-primary/12 text-foreground hover:bg-primary/18 dark:bg-primary/18 dark:hover:bg-primary/24"
							: "text-muted-foreground hover:text-foreground",
					)}
				>
					<HeartIcon
						className={cn("size-3.5", hasFavorites && "fill-rose-500 text-rose-500")}
						aria-hidden="true"
					/>
					<span className="hidden sm:inline">{copy.favorites}</span>
					{hasFavorites && (
						<span className="font-mono text-[11px] tabular-nums">{favoriteCount}</span>
					)}
				</Button>
				<div aria-hidden="true" className="mx-0.5 h-5 w-px shrink-0 bg-border" />
				<Button
					type="button"
					variant="ghost"
					size="icon"
					onClick={onSurpriseMe}
					aria-label={copy.surpriseMe}
					title={copy.surpriseMe}
					className="size-9 rounded-lg text-muted-foreground transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-90 motion-reduce:transition-none motion-reduce:active:scale-100 squircle:rounded-xl"
				>
					<DicesIcon className="size-4" aria-hidden="true" />
				</Button>
			</div>
		</div>
	);
}
