"use client";

import { Button } from "@/components/ui/button";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { Download, ShieldAlert } from "lucide-react";

const copy = brand.characterDetails;

export function CharacterDownloadTab({
	character,
	onDownload,
}: {
	character: GalleryCharacter;
	onDownload: (url: string, filename: string) => void;
}) {
	const { id, preview, galleryDirections, reactions } = character;

	return (
		<div className="flex flex-col gap-4">
			<div className="grid gap-3 sm:grid-cols-2">
				<div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs corner-squircle">
					<div className="flex flex-col gap-1">
						<h4 className="text-sm font-semibold text-foreground">{copy.directions}</h4>
						<p className="text-xs text-muted-foreground">{copy.directionsDescription}</p>
						<span className="mt-1 font-mono text-[11px] text-muted-foreground">
							{copy.sheetSpecs}
						</span>
					</div>
					<Button
						variant="secondary"
						size="sm"
						className="w-full gap-1.5 text-xs font-semibold"
						onClick={() => onDownload(galleryDirections, `${id}-directions.webp`)}
					>
						<Download data-icon="inline-start" aria-hidden="true" />
						{copy.downloadDirections}
					</Button>
				</div>

				<div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs corner-squircle">
					<div className="flex flex-col gap-1">
						<h4 className="text-sm font-semibold text-foreground">{copy.reactions}</h4>
						<p className="text-xs text-muted-foreground">{copy.reactionsDescription}</p>
						<span className="mt-1 font-mono text-[11px] text-muted-foreground">
							{copy.sheetSpecs}
						</span>
					</div>
					<Button
						variant="secondary"
						size="sm"
						className="w-full gap-1.5 text-xs font-semibold"
						onClick={() => onDownload(reactions, `${id}-reactions.webp`)}
					>
						<Download data-icon="inline-start" aria-hidden="true" />
						{copy.downloadReactions}
					</Button>
				</div>
			</div>

			<div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs corner-squircle sm:flex-row sm:items-center">
				<div className="flex flex-col gap-0.5">
					<h4 className="text-sm font-semibold text-foreground">Center Preview</h4>
					<p className="text-xs text-muted-foreground">Resting center pose WebP portrait.</p>
					<span className="font-mono text-[11px] text-muted-foreground">{copy.previewSpecs}</span>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="shrink-0 gap-1.5 text-xs"
					onClick={() => onDownload(preview, `${id}.webp`)}
				>
					<Download data-icon="inline-start" aria-hidden="true" />
					{copy.downloadPreview}
				</Button>
			</div>

			<section className="flex gap-3 rounded-xl border border-border/80 bg-muted/40 p-3.5 text-xs text-muted-foreground corner-squircle">
				<ShieldAlert className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
				<div className="flex flex-col gap-1">
					<h5 className="font-semibold text-foreground">{copy.licenseNoticeTitle}</h5>
					<p className="leading-relaxed">{copy.licenseNotice}</p>
				</div>
			</section>
		</div>
	);
}
