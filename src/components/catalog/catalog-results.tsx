"use client";

import { Button } from "@/components/ui/button";
import type { CatalogGroup, CharacterCatalogEntry } from "./types";
import { brand } from "@/lib/brand";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { memo, type RefObject } from "react";

const copy = brand.galleryControls;

export const CatalogResults = memo(function CatalogResults({
	groups,
	resultsRef,
	onSelect,
	onResetFilters,
}: {
	groups: readonly CatalogGroup[];
	resultsRef: RefObject<HTMLDivElement | null>;
	onSelect?: (character: CharacterCatalogEntry) => void;
	onResetFilters: () => void;
}) {
	return (
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
					<Button variant="outline" onClick={onResetFilters} className="mt-1">
						{copy.resetSearch}
					</Button>
				</div>
			) : (
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
			)}
		</div>
	);
});
