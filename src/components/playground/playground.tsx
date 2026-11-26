"use client";

import {
	CharacterCatalog,
	type CharacterCatalogEntry,
} from "@/components/catalog/character-catalog";
import { BoopOrderSelect } from "@/components/header/boop-order-select";
import { ReactionSoundToggle } from "@/components/header/reaction-sound-toggle";
import { Mascot, type BoopOrder, type Reaction } from "@/components/mascot/mascot";
import { SheetDropzone, type UploadedSheet } from "@/components/playground/sheet-dropzone";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { resolveGalleryCharacters, type CatalogCharacter } from "@/data/characters";
import { useReactionSound } from "@/hooks/use-reaction-sound";
import { getMascotAssetUrl } from "@/lib/assets";
import { brand } from "@/lib/brand";
import {
	ArrowLeftIcon,
	ArrowUpRightIcon,
	CompassIcon,
	LayoutGridIcon,
	ShieldCheckIcon,
	SparklesIcon,
	Trash2Icon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SheetSlot = "directions" | "reactions";

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/webp", "image/jpeg", "image/avif"]);

const copy = brand.playground;

function isSupportedImageFile(file: File): boolean {
	if (ALLOWED_MIME_TYPES.has(file.type)) return true;
	return /\.(png|webp|jpe?g|avif)$/i.test(file.name);
}

function inferSlotFromFilename(filename: string): SheetSlot | null {
	const lower = filename.toLowerCase();
	if (/(direction|gaze|look|pose)/.test(lower)) return "directions";
	if (/(reaction|boop|express|emote)/.test(lower)) return "reactions";
	return null;
}

function loadImageSheet(file: File): Promise<UploadedSheet> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new window.Image();
		img.onload = () => {
			resolve({
				url,
				name: file.name,
				width: img.naturalWidth,
				height: img.naturalHeight,
			});
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error(copy.loadError));
		};
		img.src = url;
	});
}

function revokeIfBlobUrl(url: string | null) {
	if (url?.startsWith("blob:")) {
		URL.revokeObjectURL(url);
	}
}

export function Playground({ catalog }: { catalog: readonly CatalogCharacter[] }) {
	const characters = useMemo(() => resolveGalleryCharacters(catalog), [catalog]);
	const [catalogOpen, setCatalogOpen] = useState(false);
	const [mascotLabel, setMascotLabel] = useState("Uploaded mascot preview");
	const [boopOrder, setBoopOrder] = useState<BoopOrder>("cycle");
	const [directions, setDirections] = useState<UploadedSheet | null>(null);
	const [reactions, setReactions] = useState<UploadedSheet | null>(null);
	const [errors, setErrors] = useState<Record<SheetSlot, string | null>>({
		directions: null,
		reactions: null,
	});
	const [lastReaction, setLastReaction] = useState<Reaction | null>(null);
	const { soundEnabled, toggleSound, resumeSound, playReactionSound } = useReactionSound();

	const urlsRef = useRef<{ directions: string | null; reactions: string | null }>({
		directions: null,
		reactions: null,
	});

	useEffect(() => {
		const tracked = urlsRef.current;
		return () => {
			revokeIfBlobUrl(tracked.directions);
			revokeIfBlobUrl(tracked.reactions);
		};
	}, []);

	const setSheet = useCallback((slot: SheetSlot, next: UploadedSheet | null) => {
		const previousUrl = urlsRef.current[slot];
		if (previousUrl && previousUrl !== next?.url) {
			revokeIfBlobUrl(previousUrl);
		}
		urlsRef.current[slot] = next?.url ?? null;

		if (slot === "directions") {
			setDirections(next);
		} else {
			setReactions(next);
		}
	}, []);

	const assignFileToSlot = useCallback(
		async (slot: SheetSlot, file: File) => {
			if (!isSupportedImageFile(file)) {
				setErrors((prev) => ({ ...prev, [slot]: copy.invalidFileError }));
				return;
			}

			setErrors((prev) => ({ ...prev, [slot]: null }));
			try {
				const loaded = await loadImageSheet(file);
				setSheet(slot, loaded);
				setMascotLabel("Uploaded mascot preview");
				setLastReaction(null);
			} catch {
				setErrors((prev) => ({ ...prev, [slot]: copy.loadError }));
			}
		},
		[setSheet],
	);

	const handleFilesSelected = useCallback(
		(targetSlot: SheetSlot, incoming: FileList | File[]) => {
			const files = Array.from(incoming);
			if (files.length === 0) return;

			if (files.length === 1) {
				void assignFileToSlot(targetSlot, files[0]);
				return;
			}

			// Support dropping both sheets at once onto either dropzone.
			const pair = files.slice(0, 2);
			const [first, second] = pair;
			const firstGuess = inferSlotFromFilename(first.name);
			const secondGuess = inferSlotFromFilename(second.name);

			if (firstGuess && secondGuess && firstGuess !== secondGuess) {
				void assignFileToSlot(firstGuess, first);
				void assignFileToSlot(secondGuess, second);
				return;
			}

			if (firstGuess) {
				const otherSlot: SheetSlot = firstGuess === "directions" ? "reactions" : "directions";
				void assignFileToSlot(firstGuess, first);
				void assignFileToSlot(otherSlot, second);
				return;
			}

			if (secondGuess) {
				const otherSlot: SheetSlot = secondGuess === "directions" ? "reactions" : "directions";
				void assignFileToSlot(secondGuess, second);
				void assignFileToSlot(otherSlot, first);
				return;
			}

			const otherSlot: SheetSlot = targetSlot === "directions" ? "reactions" : "directions";
			void assignFileToSlot(targetSlot, first);
			void assignFileToSlot(otherSlot, second);
		},
		[assignFileToSlot],
	);

	const handleClearAll = useCallback(() => {
		setSheet("directions", null);
		setSheet("reactions", null);
		setErrors({ directions: null, reactions: null });
		setMascotLabel("Uploaded mascot preview");
		setLastReaction(null);
	}, [setSheet]);

	const handleSelectCatalogCharacter = useCallback(
		(character: CharacterCatalogEntry) => {
			setCatalogOpen(false);
			const directionsAsset = getMascotAssetUrl({
				id: character.id,
				type: "directions",
				quality: "1080",
				version: character.v,
				fallbackUrl: character.galleryDirections,
			});
			const reactionsAsset = getMascotAssetUrl({
				id: character.id,
				type: "reactions",
				quality: "1080",
				version: character.v,
				fallbackUrl: character.reactions,
			});
			const dimensions = directionsAsset.isR2 ? 1080 : 504;

			setSheet("directions", {
				url: directionsAsset.url,
				name: directionsAsset.filename,
				width: dimensions,
				height: dimensions,
			});
			setSheet("reactions", {
				url: reactionsAsset.url,
				name: reactionsAsset.filename,
				width: dimensions,
				height: dimensions,
			});
			setErrors({ directions: null, reactions: null });
			setMascotLabel(character.name);
			setLastReaction(null);
		},
		[setSheet],
	);

	const handleReact = useCallback(
		(reaction: Reaction) => {
			setLastReaction(reaction);
			playReactionSound(reaction);
		},
		[playReactionSound],
	);

	const loadedCount = Number(directions !== null) + Number(reactions !== null);
	const hasAnySheet = loadedCount > 0;
	const activeDirectionsUrl = directions?.url ?? reactions?.url ?? null;
	const activeReactionsUrl = reactions?.url ?? directions?.url ?? null;

	return (
		<div className="flex min-h-dvh flex-col">
			<header className="sticky inset-x-0 top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 shadow-xs select-none sm:px-5 md:h-14">
				<div className="flex items-center gap-2">
					<Link
						href="/"
						aria-label={brand.name}
						className="aniboop-logo-trigger flex items-center rounded-lg corner-squircle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring squircle:rounded-xl"
					>
						<Image
							src="/brand/aniboop-logo.svg"
							alt=""
							aria-hidden="true"
							width={90}
							height={25}
							preload
							draggable={false}
							className="aspect-90/25 h-6.25 w-22.5"
						/>
					</Link>
					<div aria-hidden="true" className="mx-1 hidden h-4 w-px bg-border sm:block" />
					<Button
						asChild
						variant="ghost"
						size="default"
						className="hidden h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-foreground active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 sm:inline-flex"
					>
						<Link href="/">
							<ArrowLeftIcon className="size-3.5" aria-hidden="true" />
							{copy.backToGallery}
						</Link>
					</Button>
				</div>

				<div className="flex items-center gap-2">
					<BoopOrderSelect value={boopOrder} onValueChange={setBoopOrder} />
					<ThemeSwitcher />
					<ReactionSoundToggle enabled={soundEnabled} onToggle={toggleSound} />
				</div>
			</header>

			<main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
				<div className="w-full max-w-4xl">
					<div className="mb-6 flex flex-col items-center text-center">
						<Button
							asChild
							variant="ghost"
							size="sm"
							className="mb-2 text-muted-foreground hover:text-foreground sm:hidden"
						>
							<Link href="/">
								<ArrowLeftIcon className="size-3.5" aria-hidden="true" />
								{copy.backToGallery}
							</Link>
						</Button>
						<h1 className="font-heading text-3xl tracking-tight text-foreground sm:text-4xl">
							{copy.heading}
						</h1>
						<p className="mt-2 max-w-xl text-sm leading-relaxed text-balance text-muted-foreground sm:text-base">
							{copy.description}
						</p>
					</div>

					<div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm corner-squircle squircle:rounded-[44px]">
						<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_1fr]">
							{/* Upload controls pane */}
							<section
								aria-label={copy.sheetsHeading}
								className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:p-6 lg:border-r lg:border-b-0"
							>
								<div className="flex flex-col gap-3">
									<div className="flex h-7 items-center justify-between gap-2">
										<h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
											{copy.sheetsHeading}
										</h2>
										<div className="flex items-center gap-1">
											<Button
												type="button"
												variant="ghost"
												size="xs"
												onClick={() => setCatalogOpen(true)}
												title={copy.pickFromCatalog}
												aria-label={copy.pickFromCatalog}
												aria-haspopup="dialog"
												aria-expanded={catalogOpen}
												className="text-muted-foreground transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-foreground active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
											>
												<LayoutGridIcon className="size-3" aria-hidden="true" />
												{brand.galleryControls.catalog}
											</Button>
											{hasAnySheet && (
												<Button
													type="button"
													variant="ghost"
													size="xs"
													onClick={handleClearAll}
													className="text-muted-foreground transition-[transform,color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-foreground active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100"
												>
													<Trash2Icon className="size-3" aria-hidden="true" />
													{copy.clearAll}
												</Button>
											)}
										</div>
									</div>

									<SheetDropzone
										label={copy.directionsLabel}
										hint={copy.directionsHint}
										icon={CompassIcon}
										sheet={directions}
										error={errors.directions}
										onFilesSelected={(files) => handleFilesSelected("directions", files)}
										onRemove={() => {
											setSheet("directions", null);
											setErrors((prev) => ({ ...prev, directions: null }));
										}}
									/>

									<SheetDropzone
										label={copy.reactionsLabel}
										hint={copy.reactionsHint}
										icon={SparklesIcon}
										sheet={reactions}
										error={errors.reactions}
										onFilesSelected={(files) => handleFilesSelected("reactions", files)}
										onRemove={() => {
											setSheet("reactions", null);
											setErrors((prev) => ({ ...prev, reactions: null }));
										}}
									/>
								</div>

								<p className="text-xs leading-relaxed text-muted-foreground">{copy.dropTip}</p>
							</section>

							{/* Live preview stage */}
							<section
								aria-label="Live mascot preview"
								onPointerDown={resumeSound}
								onKeyDown={resumeSound}
								className="flex min-h-88 flex-col justify-between bg-background/45 p-5 sm:min-h-96 sm:p-6"
							>
								<div className="flex h-7 items-center justify-between gap-2">
									<span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
										<span
											aria-hidden="true"
											className={
												loadedCount === 2
													? "size-1.5 rounded-full bg-emerald-500"
													: loadedCount === 1
														? "size-1.5 rounded-full bg-amber-500"
														: "size-1.5 rounded-full bg-muted-foreground/40"
											}
										/>
										{loadedCount === 2
											? "Ready to boop"
											: loadedCount === 1
												? "1 of 2 sheets loaded"
												: "Live preview"}
									</span>

									{hasAnySheet && lastReaction && (
										<span
											key={lastReaction}
											className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-[11px] font-medium text-secondary-foreground transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none starting:scale-95 starting:opacity-0"
										>
											{lastReaction}
										</span>
									)}
								</div>

								<div className="my-4 flex flex-1 flex-col items-center justify-center">
									{activeDirectionsUrl && activeReactionsUrl ? (
										<div className="flex flex-col items-center gap-4 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none starting:scale-95 starting:opacity-0">
											<Mascot
												directions={activeDirectionsUrl}
												reactions={activeReactionsUrl}
												label={mascotLabel}
												size={216}
												mode={boopOrder}
												trackPointer
												trackAcrossPage
												onReact={handleReact}
											/>

											{(!directions || !reactions) && (
												<p className="max-w-xs text-center text-xs text-muted-foreground">
													{!reactions ? copy.missingReactions : copy.missingDirections}
												</p>
											)}
										</div>
									) : (
										<div className="flex max-w-xs flex-col items-center text-center">
											<div className="flex size-20 items-center justify-center rounded-2xl border border-dashed border-input/70 bg-card/80 text-muted-foreground corner-squircle squircle:rounded-[32px]">
												<SparklesIcon className="size-7" aria-hidden="true" />
											</div>
											<h2 className="mt-4 font-heading text-xl text-foreground">
												{copy.emptyTitle}
											</h2>
											<p className="mt-1 text-sm leading-relaxed text-balance text-muted-foreground">
												{copy.emptyDescription}
											</p>
										</div>
									)}
								</div>

								<p className="text-center text-xs text-muted-foreground">
									{hasAnySheet ? copy.previewHint : "PNG, WebP, JPEG, or AVIF · 3 × 3 grid"}
								</p>
							</section>
						</div>

						{/* Unified workbench footer: page-mascot callout + privacy assurance */}
						<div className="flex flex-col items-center justify-between gap-2.5 border-t border-border bg-muted/25 px-5 py-3.5 text-xs text-muted-foreground sm:flex-row sm:px-6">
							<p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 sm:justify-start">
								<span>{copy.createOwnPrompt}</span>
								<a
									href={copy.createOwnHref}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-0.5 rounded-xs font-medium text-primary underline decoration-primary/40 underline-offset-4 transition-[color,text-decoration-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:text-primary/80 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
								>
									{copy.createOwnAction}
									<ArrowUpRightIcon className="size-3.5 shrink-0" aria-hidden="true" />
								</a>
							</p>
							<span className="inline-flex shrink-0 items-center gap-1.5">
								<ShieldCheckIcon className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
								{copy.privacyNote}
							</span>
						</div>
					</div>
				</div>
			</main>

			<CharacterCatalog
				characters={characters}
				open={catalogOpen}
				onOpenChange={setCatalogOpen}
				onSelectCharacter={handleSelectCatalogCharacter}
				hideTrigger
				actionLabel={copy.loadInPlayground}
			/>
		</div>
	);
}
