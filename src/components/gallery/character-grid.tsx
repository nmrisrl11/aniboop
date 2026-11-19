"use client";

import { Mascot } from "@/components/mascot/mascot";
import { type Character, characterAssets, characters } from "@/data/characters";
import { memo, useCallback, useState } from "react";
import ThiingsGrid, { DRAG_THRESHOLD, type ItemConfig } from "./thiings-grid";

const PREVIEW_SIZE = 124;
const MIN_VISIBLE_RATIO = 0.01;
const MIN_FOCUS_RATIO = 0.5;
type TileVisibility = "outside" | "partial" | "focusable";

const visibilityCallbacks = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();
let tileObserver: IntersectionObserver | undefined;

const CharacterTile = memo(function CharacterTile({
	character,
	isMoving,
}: {
	character: Character;
	isMoving: boolean;
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

	return (
		<div className="absolute inset-1.5 flex flex-col items-center justify-center gap-1 squircle border bg-card px-2">
			<div
				ref={observeArt}
				className="shrink-0"
				style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
			>
				{visibility !== "outside" && (
					<Mascot
						{...characterAssets(character.id)}
						label={character.name}
						size={PREVIEW_SIZE}
						className="squircle"
						payoffs={character.payoffs}
						dragThreshold={DRAG_THRESHOLD}
						tabIndex={visibility === "focusable" ? 0 : -1}
						trackPointer={!isMoving}
					/>
				)}
			</div>
			<span className="max-w-full truncate text-center text-sm font-medium text-foreground">
				{character.name}
			</span>
		</div>
	);
});

function renderItem({ gridIndex, isMoving }: ItemConfig) {
	return (
		<CharacterTile character={characters[gridIndex % characters.length]} isMoving={isMoving} />
	);
}

export function CharacterGrid() {
	return (
		<ThiingsGrid
			className="focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
			label="Character gallery"
			describedBy="grid-instructions"
			gridSize={176}
			renderItem={renderItem}
		/>
	);
}
