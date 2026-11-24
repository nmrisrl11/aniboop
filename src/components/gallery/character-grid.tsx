"use client";

import { Mascot, type BoopOrder } from "@/components/mascot/mascot";
import { BloomImageLoader } from "@/components/ui/image-loader";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { decodeImage, isImageDecoded } from "@/lib/image-decode";
import type { Reaction } from "@/lib/mascot-sprites";
import { cn } from "@/lib/utils";
import { Maximize2Icon } from "lucide-react";
import { memo, useCallback, useEffect, useState } from "react";
import ThiingsGrid, { DRAG_THRESHOLD, type ItemConfig } from "./thiings-grid";

const GRID_SIZE = 252;
const PREVIEW_SIZE = 168;
const LOADER_FADE_MS = 220;
const MIN_VISIBLE_RATIO = 0.01;
const MIN_FOCUS_RATIO = 0.5;
type TileVisibility = "outside" | "partial" | "focusable";
type DecodeState = { url: string; status: "cached" | "loaded" | "failed" };

const visibilityCallbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();
let tileObserver: IntersectionObserver | undefined;

const CharacterTile = memo(function CharacterTile({
	character,
	bloomDelayMs,
	isMoving,
	boopOrder,
	onReact,
	onSelectCharacter,
}: {
	character: GalleryCharacter;
	bloomDelayMs: number;
	isMoving: boolean;
	boopOrder: BoopOrder;
	onReact?: (reaction: Reaction) => void;
	onSelectCharacter?: (character: GalleryCharacter) => void;
}) {
	const { preview, galleryDirections, reactions } = character;
	const [visibility, setVisibility] = useState<TileVisibility>("outside");
	const [decodeState, setDecodeState] = useState<DecodeState | null>(() =>
		isImageDecoded(preview) ? { url: preview, status: "cached" } : null,
	);
	const [dismissedPreview, setDismissedPreview] = useState<string | null>(() =>
		isImageDecoded(preview) ? preview : null,
	);

	const activeStatus =
		decodeState?.url === preview
			? decodeState.status
			: isImageDecoded(preview)
				? "cached"
				: "loading";
	const previewReady = activeStatus === "cached" || activeStatus === "loaded";
	const previewSettled = previewReady || activeStatus === "failed";
	const showLoader = dismissedPreview !== preview;

	useEffect(() => {
		if (visibility === "outside" || previewSettled) return;
		let active = true;
		void decodeImage(preview).then((decoded) => {
			if (active) setDecodeState({ url: preview, status: decoded ? "loaded" : "failed" });
		});
		return () => {
			active = false;
		};
	}, [preview, previewSettled, visibility]);

	useEffect(() => {
		if (!previewSettled || dismissedPreview === preview) return;
		const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches
			? 0
			: LOADER_FADE_MS;
		const timer = window.setTimeout(() => setDismissedPreview(preview), delay);
		return () => window.clearTimeout(timer);
	}, [dismissedPreview, preview, previewSettled]);

	const observeArt = useCallback((element: HTMLDivElement | null) => {
		if (!element) return;
		const observer = (tileObserver ??= new IntersectionObserver(
			(entries) => {
				for (const entry of entries) visibilityCallbacks.get(entry.target)?.(entry);
			},
			{ threshold: [MIN_VISIBLE_RATIO, MIN_FOCUS_RATIO] },
		));
		const restoreGridFocus = () => {
			if (element.contains(document.activeElement)) {
				element.closest<HTMLElement>('[role="region"]')?.focus({ preventScroll: true });
			}
		};

		visibilityCallbacks.set(element, ({ intersectionRatio }) => {
			if (intersectionRatio >= MIN_FOCUS_RATIO) {
				setVisibility("focusable");
			} else if (intersectionRatio >= MIN_VISIBLE_RATIO) {
				setVisibility("partial");
			} else {
				restoreGridFocus();
				setVisibility("outside");
				setDecodeState((current) => (current?.status === "failed" ? null : current));
			}
		});
		observer.observe(element);
		return () => {
			restoreGridFocus();
			observer.unobserve(element);
			visibilityCallbacks.delete(element);
		};
	}, []);

	return (
		<div className="group/tile absolute inset-2 flex flex-col items-center justify-center gap-2 rounded-3xl border bg-card px-4 py-2.5 text-card-foreground shadow-xs corner-squircle squircle:rounded-[44px]">
			{showLoader && (
				<div
					aria-hidden="true"
					className={cn(
						"pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200 ease-out motion-reduce:transition-none",
						previewSettled ? "opacity-0" : "opacity-100",
					)}
				>
					<BloomImageLoader delayMs={bloomDelayMs} className="size-40" />
				</div>
			)}
			<div
				ref={observeArt}
				className="shrink-0"
				style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
			>
				{visibility !== "outside" && previewReady && (
					<Mascot
						preview={preview}
						directions={galleryDirections}
						reactions={reactions}
						label={character.name}
						size={PREVIEW_SIZE}
						className={cn(
							"rounded-2xl corner-squircle squircle:rounded-4xl",
							activeStatus === "loaded" &&
								"animate-in duration-200 ease-out fade-in motion-reduce:animate-none",
						)}
						mode={boopOrder}
						onReact={onReact}
						dragThreshold={DRAG_THRESHOLD}
						tabIndex={visibility === "focusable" ? 0 : -1}
						trackPointer={!isMoving}
						trackAcrossPage
					/>
				)}
			</div>
			{visibility === "focusable" && previewSettled && onSelectCharacter && (
				<button
					type="button"
					tabIndex={visibility === "focusable" ? 0 : -1}
					onClick={() => onSelectCharacter(character)}
					className="absolute top-2.5 right-2.5 z-10 flex size-8 scale-80 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] corner-squircle group-hover/tile:scale-100 group-hover/tile:opacity-100 hover:scale-110 hover:bg-muted hover:text-foreground focus-visible:scale-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring active:scale-95 motion-reduce:scale-100 motion-reduce:transition-opacity max-md:top-1.5 max-md:right-1.5 max-md:size-10 max-md:scale-100 max-md:opacity-100 squircle:rounded-full"
					aria-label={`${brand.characterDetails.viewAndDownload}: ${character.name}`}
					title={`${brand.characterDetails.viewAndDownload}: ${character.name}`}
				>
					<Maximize2Icon className="size-3.5 max-md:size-4" aria-hidden="true" />
				</button>
			)}
			<div
				className={cn(
					"max-w-full text-center transition-opacity duration-200 ease-out select-none motion-reduce:transition-none",
					previewSettled ? "opacity-100" : "opacity-0",
				)}
			>
				<p className="truncate text-sm font-semibold">{character.name}</p>
				<p className="truncate text-xs text-muted-foreground">{character.series}</p>
			</div>
		</div>
	);
});

export function CharacterGrid({
	characters,
	boopOrder,
	onReact,
	onSelectCharacter,
}: {
	characters: readonly GalleryCharacter[];
	boopOrder: BoopOrder;
	onReact?: (reaction: Reaction) => void;
	onSelectCharacter?: (character: GalleryCharacter) => void;
}) {
	const renderItem = useCallback(
		({ gridIndex, isMoving, position }: ItemConfig) => {
			const character = characters[gridIndex % characters.length];
			return character ? (
				<CharacterTile
					character={character}
					bloomDelayMs={-Math.round(Math.hypot(position.x, position.y) * 180)}
					isMoving={isMoving}
					boopOrder={boopOrder}
					onReact={onReact}
					onSelectCharacter={onSelectCharacter}
				/>
			) : null;
		},
		[characters, boopOrder, onReact, onSelectCharacter],
	);
	return (
		<ThiingsGrid
			className="z-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
			label={brand.galleryHeading}
			describedBy="grid-instructions"
			gridSize={GRID_SIZE}
			renderItem={renderItem}
		/>
	);
}
