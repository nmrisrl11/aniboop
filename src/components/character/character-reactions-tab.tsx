"use client";

import { Button } from "@/components/ui/button";
import { getSpriteStyle } from "./character-details-utils";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { Download } from "lucide-react";

const copy = brand.characterDetails;

export function CharacterReactionsTab({
	character,
	onDownload,
}: {
	character: GalleryCharacter;
	onDownload: (url: string, filename: string) => void;
}) {
	const { id, name, reactions } = character;

	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 corner-squircle">
				<div className="flex flex-col">
					<span className="text-xs font-semibold text-foreground">{copy.reactions}</span>
					<span className="font-mono text-xs text-muted-foreground">{copy.sheetSpecs}</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="gap-1.5 text-xs"
					onClick={() => onDownload(reactions, `${id}-reactions.webp`)}
				>
					<Download data-icon="inline-start" aria-hidden="true" />
					{copy.downloadReactions}
				</Button>
			</div>

			<div className="grid grid-cols-3 gap-2.5 sm:gap-3">
				{copy.reactionsAtlas.map((item) => (
					<div
						key={item.id}
						className="flex flex-col items-center gap-1.5 rounded-xl border border-border/70 bg-card p-2 text-center shadow-xs corner-squircle"
					>
						<div
							className="size-16 shrink-0 rounded-lg bg-card/50 transition-transform sm:size-20"
							style={getSpriteStyle(reactions, item.id)}
							role="img"
							aria-label={`${name} ${item.label} reaction`}
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
