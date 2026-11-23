"use client";

import { Button } from "@/components/ui/button";
import type { GalleryCharacter } from "@/data/characters";
import { getMascotAssetUrl, type SheetQuality } from "@/lib/assets";
import { brand } from "@/lib/brand";
import { cn } from "cn";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";
import { getSpriteStyle } from "./character-details-utils";

const copy = brand.characterDetails;

export function CharacterDetailsContent({
	character,
	onDownload,
}: {
	character: GalleryCharacter;
	onDownload: (url: string, filename: string) => void;
}) {
	const { id, name, galleryDirections, reactions } = character;
	const [quality, setQuality] = useState<SheetQuality>("1080");

	const directionsAsset = getMascotAssetUrl({
		id,
		type: "directions",
		quality,
		fallbackUrl: galleryDirections,
	});

	const reactionsAsset = getMascotAssetUrl({
		id,
		type: "reactions",
		quality,
		fallbackUrl: reactions,
	});

	return (
		<div className="catalog-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
			{/* Quality Selector Segmented Control with concentric padding and radii */}
			<div className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-muted/30 p-3.5 corner-squircle">
				<div className="flex items-center justify-between px-0.5">
					<span className="text-xs font-semibold text-foreground">{copy.qualityLabel}</span>
					<span className="text-xs text-muted-foreground">
						{quality === "1080" ? copy.qualityHDDescription : copy.qualityWebDescription}
					</span>
				</div>
				<div className="grid grid-cols-2 gap-1 rounded-xl border border-border/50 bg-background/70 p-1">
					<button
						type="button"
						onClick={() => setQuality("1080")}
						className={cn(
							"h-8.5 cursor-pointer rounded-lg text-xs font-medium transition-all duration-160 ease-out select-none",
							quality === "1080"
								? "bg-card text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{copy.qualityHD}
					</button>

					<button
						type="button"
						onClick={() => setQuality("504")}
						className={cn(
							"h-8.5 cursor-pointer rounded-lg text-xs font-medium transition-all duration-160 ease-out select-none",
							quality === "504"
								? "bg-card text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{copy.qualityWeb}
					</button>
				</div>
			</div>

			{/* Asset Download Cards */}
			<div className="grid gap-3 sm:grid-cols-2">
				{/* Directions Card */}
				<div className="flex flex-col justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-xs corner-squircle">
					<div className="flex items-start gap-3">
						<div
							className="size-12 shrink-0 rounded-lg border border-border/50 bg-card/60 shadow-2xs"
							style={getSpriteStyle(galleryDirections, 4)}
							role="img"
							aria-label={`${name} directions sheet preview`}
						/>
						<div className="flex min-w-0 flex-col gap-1">
							<h4 className="text-sm font-semibold text-foreground">{copy.directions}</h4>
							<p className="text-xs leading-relaxed text-muted-foreground">
								{copy.directionsDescription}
							</p>
						</div>
					</div>
					<Button
						variant="secondary"
						size="sm"
						className="w-full text-xs font-semibold tracking-wide transition-all duration-160 ease-out hover:bg-secondary/80"
						onClick={() => onDownload(directionsAsset.url, directionsAsset.filename)}
					>
						{copy.downloadDirections}
					</Button>
				</div>

				{/* Reactions Card */}
				<div className="flex flex-col justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-xs corner-squircle">
					<div className="flex items-start gap-3">
						<div
							className="size-12 shrink-0 rounded-lg border border-border/50 bg-card/60 shadow-2xs"
							style={getSpriteStyle(reactions, 2)}
							role="img"
							aria-label={`${name} reactions sheet preview`}
						/>
						<div className="flex min-w-0 flex-col gap-1">
							<h4 className="text-sm font-semibold text-foreground">{copy.reactions}</h4>
							<p className="text-xs leading-relaxed text-muted-foreground">
								{copy.reactionsDescription}
							</p>
						</div>
					</div>
					<Button
						variant="secondary"
						size="sm"
						className="w-full text-xs font-semibold tracking-wide transition-all duration-160 ease-out hover:bg-secondary/80"
						onClick={() => onDownload(reactionsAsset.url, reactionsAsset.filename)}
					>
						{copy.downloadReactions}
					</Button>
				</div>
			</div>

			{/* License and usage terms */}
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
