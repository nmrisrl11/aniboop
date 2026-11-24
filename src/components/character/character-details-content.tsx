"use client";

import { Button } from "@/components/ui/button";
import { BloomImageLoader } from "@/components/ui/image-loader";
import type { GalleryCharacter } from "@/data/characters";
import type { DownloadOptions } from "@/hooks/use-download";
import { getMascotAssetUrl, type SheetQuality } from "@/lib/assets";
import { brand } from "@/lib/brand";
import { decodeImage, isImageDecoded } from "@/lib/image-decode";
import { cn } from "@/lib/utils";
import { LoaderCircleIcon, ShieldAlertIcon } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { getSpriteStyle } from "./character-details-utils";

const copy = brand.characterDetails;
const LOADER_FADE_MS = 220;

type SheetDecodeState = { url: string; status: "cached" | "loaded" | "failed" };

function SheetPreview({ sheet, cell, alt }: { sheet: string; cell: number; alt: string }) {
	const [decodeState, setDecodeState] = useState<SheetDecodeState | null>(() =>
		isImageDecoded(sheet) ? { url: sheet, status: "cached" } : null,
	);
	const [dismissedSheet, setDismissedSheet] = useState<string | null>(() =>
		isImageDecoded(sheet) ? sheet : null,
	);
	const activeStatus =
		decodeState?.url === sheet ? decodeState.status : isImageDecoded(sheet) ? "cached" : "loading";
	const ready = activeStatus === "cached" || activeStatus === "loaded";
	const settled = ready || activeStatus === "failed";
	const showLoader = dismissedSheet !== sheet;

	useEffect(() => {
		if (settled) return;
		let active = true;
		void decodeImage(sheet).then((decoded) => {
			if (active) setDecodeState({ url: sheet, status: decoded ? "loaded" : "failed" });
		});
		return () => {
			active = false;
		};
	}, [settled, sheet]);

	useEffect(() => {
		if (!settled || dismissedSheet === sheet) return;
		const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
			? 0
			: LOADER_FADE_MS;
		const timer = window.setTimeout(() => setDismissedSheet(sheet), delay);
		return () => window.clearTimeout(timer);
	}, [dismissedSheet, settled, sheet]);

	return (
		<div
			className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-card/60 shadow-2xs corner-squircle squircle:rounded-full"
			role="img"
			aria-label={alt}
		>
			{showLoader && (
				<BloomImageLoader
					className={cn(
						"pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out motion-reduce:transition-none",
						settled ? "opacity-0" : "opacity-100",
					)}
				/>
			)}
			{ready && (
				<span
					aria-hidden="true"
					className={cn(
						"absolute inset-0 block bg-no-repeat",
						activeStatus === "loaded" &&
							"animate-in duration-200 ease-out fade-in motion-reduce:animate-none",
					)}
					style={getSpriteStyle(sheet, cell)}
				/>
			)}
		</div>
	);
}

export function CharacterDetailsContent({
	character,
	onDownload,
	isDownloading,
}: {
	character: GalleryCharacter;
	onDownload: (url: string, filename: string, options?: DownloadOptions) => void;
	isDownloading: (url: string) => boolean;
}) {
	const { id, name, v, galleryDirections, reactions } = character;
	const [quality, setQuality] = useState<SheetQuality>("1080");
	const qualityLabelId = useId();
	const qualityDescriptionId = useId();

	const directionsAsset = getMascotAssetUrl({
		id,
		type: "directions",
		quality,
		version: v,
		fallbackUrl: galleryDirections,
	});

	const reactionsAsset = getMascotAssetUrl({
		id,
		type: "reactions",
		quality,
		version: v,
		fallbackUrl: reactions,
	});

	const downloadingDirections = isDownloading(directionsAsset.url);
	const downloadingReactions = isDownloading(reactionsAsset.url);

	return (
		<div className="catalog-scrollbar flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
			{/* Quality Selector Segmented Control with concentric padding and radii */}
			<div className="flex flex-col gap-2.5 rounded-2xl border border-border/70 bg-muted/30 p-3.5 corner-squircle squircle:rounded-[32px]">
				<div className="flex items-center justify-between px-0.5">
					<span id={qualityLabelId} className="text-xs font-semibold text-foreground">
						{copy.qualityLabel}
					</span>
					<span id={qualityDescriptionId} className="text-xs text-muted-foreground">
						{quality === "1080" ? copy.qualityHDDescription : copy.qualityWebDescription}
					</span>
				</div>
				<div
					role="group"
					aria-labelledby={qualityLabelId}
					aria-describedby={qualityDescriptionId}
					className="grid grid-cols-2 gap-1 rounded-xl border border-border/50 bg-background/70 p-1 corner-squircle squircle:rounded-3xl"
				>
					<button
						type="button"
						aria-pressed={quality === "1080"}
						onClick={() => setQuality("1080")}
						className={cn(
							"h-8.5 cursor-pointer rounded-lg text-xs font-medium transition-all duration-160 ease-out select-none corner-squircle focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none squircle:rounded-xl",
							quality === "1080"
								? "bg-card text-foreground shadow-xs"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{copy.qualityHD}
					</button>

					<button
						type="button"
						aria-pressed={quality === "504"}
						onClick={() => setQuality("504")}
						className={cn(
							"h-8.5 cursor-pointer rounded-lg text-xs font-medium transition-all duration-160 ease-out select-none corner-squircle focus-visible:outline-2 focus-visible:outline-ring motion-reduce:transition-none squircle:rounded-xl",
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
				<div className="flex flex-col justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-xs corner-squircle squircle:rounded-3xl">
					<div className="flex items-start gap-3">
						<SheetPreview
							sheet={galleryDirections}
							cell={4}
							alt={`${name} directions sheet preview`}
						/>
						<div className="flex min-w-0 flex-col gap-1">
							<h3 className="text-sm font-semibold text-foreground">{copy.directions}</h3>
							<p className="text-xs leading-relaxed text-muted-foreground">
								{copy.directionsDescription}
							</p>
						</div>
					</div>
					<Button
						variant="secondary"
						size="sm"
						disabled={downloadingDirections}
						aria-busy={downloadingDirections || undefined}
						className="w-full text-xs font-semibold tracking-wide transition-all duration-160 ease-out hover:bg-secondary/80 motion-reduce:transition-none"
						onClick={() =>
							onDownload(directionsAsset.url, directionsAsset.filename, {
								fallbackUrl: galleryDirections,
							})
						}
					>
						{downloadingDirections ? (
							<>
								<LoaderCircleIcon
									data-icon="inline-start"
									className="animate-spin motion-reduce:animate-none"
									aria-hidden="true"
								/>
								{copy.downloading}
							</>
						) : (
							copy.downloadDirections
						)}
					</Button>
				</div>

				{/* Reactions Card */}
				<div className="flex flex-col justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-xs corner-squircle squircle:rounded-3xl">
					<div className="flex items-start gap-3">
						<SheetPreview sheet={reactions} cell={2} alt={`${name} reactions sheet preview`} />
						<div className="flex min-w-0 flex-col gap-1">
							<h3 className="text-sm font-semibold text-foreground">{copy.reactions}</h3>
							<p className="text-xs leading-relaxed text-muted-foreground">
								{copy.reactionsDescription}
							</p>
						</div>
					</div>
					<Button
						variant="secondary"
						size="sm"
						disabled={downloadingReactions}
						aria-busy={downloadingReactions || undefined}
						className="w-full text-xs font-semibold tracking-wide transition-all duration-160 ease-out hover:bg-secondary/80 motion-reduce:transition-none"
						onClick={() =>
							onDownload(reactionsAsset.url, reactionsAsset.filename, {
								fallbackUrl: reactions,
							})
						}
					>
						{downloadingReactions ? (
							<>
								<LoaderCircleIcon
									data-icon="inline-start"
									className="animate-spin motion-reduce:animate-none"
									aria-hidden="true"
								/>
								{copy.downloading}
							</>
						) : (
							copy.downloadReactions
						)}
					</Button>
				</div>
			</div>

			{/* License and usage terms */}
			<section className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 corner-squircle sm:p-4 dark:bg-input/30 squircle:rounded-3xl">
				<ShieldAlertIcon className="size-3.5 text-foreground" aria-hidden="true" />

				<div className="flex-1 space-y-1">
					<h3 className="text-xs font-semibold text-foreground">{copy.licenseNoticeTitle}</h3>
					<p className="text-xs leading-relaxed text-muted-foreground">{copy.licenseNotice}</p>
				</div>
			</section>
		</div>
	);
}
