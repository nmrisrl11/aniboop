"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { ArrowLeft, Download, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, useCallback } from "react";

const copy = brand.characterDetails;

function getSpriteStyle(sheet: string, cell: number): CSSProperties {
	return {
		backgroundImage: `url(${JSON.stringify(sheet)})`,
		backgroundPosition: `${(cell % 3) * 50}% ${Math.floor(cell / 3) * 50}%`,
		backgroundSize: "300% 300%",
	};
}

export function CharacterDetailsModal({
	character,
	open,
	onOpenChange,
	onBackToCatalog,
}: {
	character: GalleryCharacter | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onBackToCatalog?: () => void;
}) {
	const handleDownload = useCallback(async (url: string, filename: string) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const blobUrl = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(blobUrl);
		} catch {
			window.open(url, "_blank");
		}
	}, []);

	if (!character) return null;

	const { id, name, series, preview, galleryDirections, reactions } = character;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-hidden p-0 sm:max-h-[calc(100dvh-3rem)]">
				<DialogHeader className="border-b border-border bg-muted/30 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
					{onBackToCatalog && (
						<div className="mb-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={onBackToCatalog}
								className="-ml-2 h-7 gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-all duration-160 ease-out corner-squircle hover:bg-muted hover:text-foreground active:scale-95"
							>
								<ArrowLeft data-icon="inline-start" aria-hidden="true" />
								Back to catalog
							</Button>
						</div>
					)}
					<div className="flex items-center gap-4">
						<div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-xs corner-squircle sm:size-18">
							<Image
								src={preview}
								alt={brand.galleryControls.portraitAlt(name)}
								width={64}
								height={64}
								unoptimized
								className="size-full object-contain"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<DialogTitle className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
									{name}
								</DialogTitle>
								<span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
									{series}
								</span>
							</div>
							<DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
								{copy.dialogDescription}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="catalog-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
					<Tabs defaultValue="directions" className="flex flex-col gap-4">
						<TabsList className="grid h-11 w-full grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/60 p-1 corner-squircle">
							<TabsTrigger value="directions" className="text-xs sm:text-sm">
								{copy.directions}
							</TabsTrigger>
							<TabsTrigger value="reactions" className="text-xs sm:text-sm">
								{copy.reactions}
							</TabsTrigger>
							<TabsTrigger value="download" className="text-xs sm:text-sm">
								{copy.download}
							</TabsTrigger>
						</TabsList>

						<TabsContent value="directions" className="flex flex-col gap-4 outline-none">
							<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 corner-squircle">
								<div className="flex flex-col">
									<span className="text-xs font-semibold text-foreground">{copy.directions}</span>
									<span className="font-mono text-xs text-muted-foreground">{copy.sheetSpecs}</span>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="gap-1.5 text-xs"
									onClick={() => handleDownload(galleryDirections, `${id}-directions.webp`)}
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
						</TabsContent>

						<TabsContent value="reactions" className="flex flex-col gap-4 outline-none">
							<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/40 px-3.5 py-2.5 corner-squircle">
								<div className="flex flex-col">
									<span className="text-xs font-semibold text-foreground">{copy.reactions}</span>
									<span className="font-mono text-xs text-muted-foreground">{copy.sheetSpecs}</span>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="gap-1.5 text-xs"
									onClick={() => handleDownload(reactions, `${id}-reactions.webp`)}
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
						</TabsContent>

						<TabsContent value="download" className="flex flex-col gap-4 outline-none">
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
										onClick={() => handleDownload(galleryDirections, `${id}-directions.webp`)}
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
										onClick={() => handleDownload(reactions, `${id}-reactions.webp`)}
									>
										<Download data-icon="inline-start" aria-hidden="true" />
										{copy.downloadReactions}
									</Button>
								</div>
							</div>

							<div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-xs corner-squircle sm:flex-row sm:items-center">
								<div className="flex flex-col gap-0.5">
									<h4 className="text-sm font-semibold text-foreground">Center Preview</h4>
									<p className="text-xs text-muted-foreground">
										Resting center pose WebP portrait.
									</p>
									<span className="font-mono text-[11px] text-muted-foreground">
										{copy.previewSpecs}
									</span>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="shrink-0 gap-1.5 text-xs"
									onClick={() => handleDownload(preview, `${id}.webp`)}
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
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>
		</Dialog>
	);
}
