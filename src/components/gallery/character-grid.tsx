"use client";

import { Mascot, type BoopOrder } from "@/components/mascot/mascot";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import type { Reaction } from "@/lib/mascot-sprites";
import { memo, useCallback, useState } from "react";
import ThiingsGrid, { DRAG_THRESHOLD, type ItemConfig } from "./thiings-grid";

const GRID_SIZE = 252;
const PREVIEW_SIZE = 168;
const MIN_VISIBLE_RATIO = 0.01;
const MIN_FOCUS_RATIO = 0.5;
type TileVisibility = "outside" | "partial" | "focusable";

const visibilityCallbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();
let tileObserver: IntersectionObserver | undefined;

const CharacterTile = memo(function CharacterTile({
	character,
	isMoving,
	boopOrder,
	onReact,
}: {
	character: GalleryCharacter;
	isMoving: boolean;
	boopOrder: BoopOrder;
	onReact?: (reaction: Reaction) => void;
}) {
	const [visibility, setVisibility] = useState<TileVisibility>("outside");
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
			}
		});
		observer.observe(element);
		return () => {
			restoreGridFocus();
			observer.unobserve(element);
			visibilityCallbacks.delete(element);
		};
	}, []);

	const { preview, galleryDirections, reactions } = character;
	return (
		<div className="absolute inset-2 flex flex-col items-center justify-center gap-2 squircle border bg-card px-4 py-2.5 text-card-foreground shadow-xs">
			<div
				ref={observeArt}
				className="shrink-0"
				style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
			>
				{visibility !== "outside" && (
					<Mascot
						preview={preview}
						directions={galleryDirections}
						reactions={reactions}
						label={character.name}
						size={PREVIEW_SIZE}
						className="squircle"
						mode={boopOrder}
						onReact={onReact}
						dragThreshold={DRAG_THRESHOLD}
						tabIndex={visibility === "focusable" ? 0 : -1}
						trackPointer={!isMoving}
						trackAcrossPage
					/>
				)}
			</div>
			<div className="max-w-full text-center">
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
}: {
	characters: readonly GalleryCharacter[];
	boopOrder: BoopOrder;
	onReact?: (reaction: Reaction) => void;
}) {
	const renderItem = useCallback(
		({ gridIndex, isMoving }: ItemConfig) => {
			const character = characters[gridIndex % characters.length];
			return character ? (
				<CharacterTile
					character={character}
					isMoving={isMoving}
					boopOrder={boopOrder}
					onReact={onReact}
				/>
			) : null;
		},
		[characters, boopOrder, onReact],
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
