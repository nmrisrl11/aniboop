"use client";

import { Button } from "@/components/ui/button";
import { getSpriteStyle } from "./character-details-utils";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { Download } from "lucide-react";

const copy = brand.characterDetails;

export function CharacterDirectionsTab({
	character,
	onDownload,
}: {
	character: GalleryCharacter;
	onDownload: (url: string, filename: string) => void;
}) {
	const { id, name, galleryDirections } = character;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 corner-squircle">
				<div className="flex flex-col">
					<span className="text-xs font-semibold text-foreground">{copy.directions}</span>
					<span className="font-mono text-xs text-muted-foreground">{copy.sheetSpecs}</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="gap-1.5 text-xs"
					onClick={() => onDownload(galleryDirections, `${id}-directions.webp`)}
				>
					<Download data-icon="inline-start" aria-hidden="true" />
					{copy.downloadDirections}
				</Button>
			</div>

			<div className="grid grid-cols-3 gap-2.5 sm:gap-3">
				{copy.directionsAtlas.map((item) => (
					<div
						key={item.id}
						className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-card p-2 text-center shadow-xs corner-squircle"
					>
						<div
							className="size-16 shrink-0 rounded-lg bg-card/50 transition-transform sm:size-20"
							style={getSpriteStyle(galleryDirections, item.id)}
							role="img"
							aria-label={`${name} looking ${item.label}`}
						/>
						<span className="text-[11px] font-medium text-muted-foreground sm:text-xs">
							{item.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
