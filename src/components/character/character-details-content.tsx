"use client";

import { Button } from "@/components/ui/button";
import { BloomImageLoader } from "@/components/ui/image-loader";
import type { GalleryCharacter } from "@/data/characters";
import { useCopy } from "@/hooks/use-copy";
import type { DownloadOptions } from "@/hooks/use-download";
import { getMascotAssetUrl, type SheetQuality } from "@/lib/assets";
import { brand } from "@/lib/brand";
import { decodeImage, isImageDecoded } from "@/lib/image-decode";
import { getCharacterSharePath, getPlaygroundCharacterPath } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import {
	ArrowUpRightIcon,
	CheckIcon,
	FlaskConicalIcon,
	Link2Icon,
	LoaderCircleIcon,
	ShieldAlertIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { getSpriteStyle } from "./character-details-utils";

const copy = brand.characterDetails;
const LOADER_FADE_MS = 220;

const QUALITY_OPTIONS: readonly { value: SheetQuality; label: string }[] = [
	{ value: "1080", label: copy.qualityHD },
	{ value: "504", label: copy.qualityWeb },
];

const FOOTER_ACTION_CLASS =
	"text-xs text-muted-foreground transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100";

const COPY_ICON_CLASS =
	"absolute size-3.5 transition-[transform,opacity,filter] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none";

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

function AssetDownloadCard({
	sheet,
	cell,
	previewAlt,
	title,
	description,
	actionLabel,
	downloading,
	onDownload,
}: {
	sheet: string;
	cell: number;
	previewAlt: string;
	title: string;
	description: string;
	actionLabel: string;
	downloading: boolean;
	onDownload: () => void;
}) {
	return (
		<div className="flex flex-col justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-4 shadow-xs corner-squircle squircle:rounded-3xl">
			<div className="flex items-start gap-3">
				<SheetPreview sheet={sheet} cell={cell} alt={previewAlt} />
				<div className="flex min-w-0 flex-col gap-1">
					<h3 className="text-sm font-semibold text-foreground">{title}</h3>
					<p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
				</div>
			</div>
			<Button
				variant="secondary"
				size="sm"
				disabled={downloading}
				aria-busy={downloading || undefined}
				className="w-full text-xs font-semibold tracking-wide transition-[transform,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-secondary/80 active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
				onClick={onDownload}
			>
				{downloading ? (
					<>
						<LoaderCircleIcon
							data-icon="inline-start"
							className="animate-spin motion-reduce:animate-none"
							aria-hidden="true"
						/>
						{copy.downloading}
					</>
				) : (
					actionLabel
				)}
			</Button>
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
	const { copy: copyText, copied, failed, reset: resetCopy } = useCopy();
	const qualityLabelId = useId();
	const qualityDescriptionId = useId();

	useEffect(() => {
		resetCopy();
	}, [id, resetCopy]);

	const handleCopyLink = () => {
		if (typeof window === "undefined") return;
		void copyText(`${window.location.origin}${getCharacterSharePath(id)}`);
	};

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

	return (
		<>
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
						{QUALITY_OPTIONS.map((option) => {
							const active = quality === option.value;
							return (
								<button
									key={option.value}
									type="button"
									aria-pressed={active}
									onClick={() => setQuality(option.value)}
									className={cn(
										"h-8.5 cursor-pointer rounded-lg text-xs font-medium transition-[transform,color,background-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] select-none corner-squircle focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 squircle:rounded-xl",
										active
											? "bg-card text-foreground shadow-xs"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{option.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Asset Download Cards */}
				<div className="grid gap-3 sm:grid-cols-2">
					<AssetDownloadCard
						sheet={galleryDirections}
						cell={4}
						previewAlt={`${name} directions sheet preview`}
						title={copy.directions}
						description={copy.directionsDescription}
						actionLabel={copy.downloadDirections}
						downloading={isDownloading(directionsAsset.url)}
						onDownload={() =>
							onDownload(directionsAsset.url, directionsAsset.filename, {
								fallbackUrl: galleryDirections,
							})
						}
					/>
					<AssetDownloadCard
						sheet={reactions}
						cell={2}
						previewAlt={`${name} reactions sheet preview`}
						title={copy.reactions}
						description={copy.reactionsDescription}
						actionLabel={copy.downloadReactions}
						downloading={isDownloading(reactionsAsset.url)}
						onDownload={() =>
							onDownload(reactionsAsset.url, reactionsAsset.filename, {
								fallbackUrl: reactions,
							})
						}
					/>
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

			{/* Quiet pinned utility footer: Try in Playground + Copy shareable link */}
			<div className="flex shrink-0 items-center justify-between gap-2 border-t border-border bg-muted/30 px-4 py-2.5 sm:px-6">
				<Button asChild variant="ghost" className={cn("group", FOOTER_ACTION_CLASS)}>
					<Link href={getPlaygroundCharacterPath(id)}>
						<FlaskConicalIcon className="size-3.5" aria-hidden="true" />
						<span>{copy.tryInPlayground}</span>
						<ArrowUpRightIcon
							className="size-3.5 opacity-60 transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none pointer-fine:group-hover:translate-x-0.5 pointer-fine:group-hover:-translate-y-0.5 pointer-fine:group-hover:opacity-100 motion-reduce:pointer-fine:group-hover:translate-x-0 motion-reduce:pointer-fine:group-hover:translate-y-0"
							aria-hidden="true"
						/>
					</Link>
				</Button>
				<Button
					type="button"
					variant="ghost"
					onClick={handleCopyLink}
					className={cn(FOOTER_ACTION_CLASS, copied && "text-foreground")}
				>
					<span className="relative flex size-3.5 items-center justify-center" aria-hidden="true">
						<Link2Icon
							className={cn(
								COPY_ICON_CLASS,
								copied ? "scale-90 opacity-0 blur-[2px]" : "scale-100 opacity-100 blur-none",
							)}
						/>
						<CheckIcon
							className={cn(
								COPY_ICON_CLASS,
								"text-primary",
								copied ? "scale-100 opacity-100 blur-none" : "scale-90 opacity-0 blur-[2px]",
							)}
						/>
					</span>
					<span>{copied ? copy.linkCopied : failed ? copy.copyLinkFailed : copy.copyLink}</span>
				</Button>
			</div>
		</>
	);
}
