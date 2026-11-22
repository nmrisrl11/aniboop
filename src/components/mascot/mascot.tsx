"use client";

// Adapted from nmrisrl-v2 and page-mascot. See THIRD_PARTY_NOTICES.txt.
import { REACTIONS, type Reaction } from "@/lib/mascot-sprites";
import { cn } from "@/lib/utils";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { subscribeToPagePointer } from "./page-pointer";
import { useMascotGesture } from "./use-mascot-gesture";

export { REACTIONS, type Reaction } from "@/lib/mascot-sprites";

// The direction atlas is row-major, while atan2 starts to the right.
const CLOCKWISE_CELLS = [5, 8, 7, 6, 3, 0, 1, 2];
const CENTER_CELL = 4;
const SECTOR = (Math.PI * 2) / CLOCKWISE_CELLS.length;
const HYSTERESIS = 0.12;
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const GAZE_DELAY = 160;
const DIRECTION_RETRY_DELAY = 2000;
const DEFAULT_PAYOFFS: readonly Reaction[] = ["heart", "sparkle", "delighted"];
const BOOP_END = 560;
const DIZZY_END = 1100;

const SQUASH: Keyframe[] = [
	{ transform: "scale(1, 1)", easing: "ease-in" },
	{ transform: "scale(1.10, 0.86)", offset: 0.18, easing: "ease-out" },
	{ transform: "scale(0.95, 1.08)", offset: 0.45, easing: "ease-in-out" },
	{ transform: "scale(1.03, 0.97)", offset: 0.72, easing: "ease-in-out" },
	{ transform: "scale(1, 1)" },
];
const PINCH_WOBBLE: Keyframe[] = [
	{ transform: "scale(0.86, 1.15) rotate(-3deg)" },
	{ transform: "scale(0.88, 1.12) rotate(3deg)", offset: 0.5 },
	{ transform: "scale(0.86, 1.15) rotate(-3deg)" },
];
const PINCH_RELEASE: Keyframe[] = [
	{ transform: "scale(0.86, 1.15)", easing: "ease-out" },
	{ transform: "scale(1.24, 0.82)", offset: 0.22, easing: "ease-in-out" },
	{ transform: "scale(0.92, 1.10)", offset: 0.48, easing: "ease-in-out" },
	{ transform: "scale(1.06, 0.96)", offset: 0.74, easing: "ease-in-out" },
	{ transform: "scale(1, 1)" },
];

function sprite(sheet: string, cell?: number): CSSProperties {
	return {
		backgroundImage: `url(${JSON.stringify(sheet)})`,
		backgroundPosition:
			cell === undefined ? "center" : `${(cell % 3) * 50}% ${Math.floor(cell / 3) * 50}%`,
		backgroundSize: cell === undefined ? "100% 100%" : "300% 300%",
	};
}

const pendingSheets = new Map<string, Promise<boolean>>();

function decodeSheet(url: string) {
	const pending = pendingSheets.get(url);
	if (pending) return pending;

	const image = new Image();
	image.src = url;
	const decoded = image
		.decode()
		.then(
			() => true,
			() => false,
		)
		.finally(() => pendingSheets.delete(url));
	pendingSheets.set(url, decoded);
	return decoded;
}

function aim(box: DOMRect, x: number, y: number, sector: number, deadZone: number) {
	const dx = x - (box.left + box.width / 2);
	const dy = y - (box.top + box.height / 2);
	if (Math.hypot(dx, dy) < deadZone) return -1;

	const angle = Math.atan2(dy, dx);
	const delta = angle - sector * SECTOR;
	const wrapped = Math.atan2(Math.sin(delta), Math.cos(delta));
	if (sector !== -1 && Math.abs(wrapped) < SECTOR / 2 + HYSTERESIS) return sector;
	return (Math.round(angle / SECTOR) + CLOCKWISE_CELLS.length) % CLOCKWISE_CELLS.length;
}

export type BoopOrder = "cycle" | "random" | "escalate";

export type MascotProps = {
	/** URLs of the matching 3×3 sprite sheets. */
	directions: string;
	reactions: string;
	/** A single center pose. With a preview, full sheets load on interaction. */
	preview?: string;
	/** Accessible name of the character. */
	label: string;
	size?: number;
	className?: string;
	tabIndex?: number;
	trackPointer?: boolean;
	/** Follow the cursor across the page, including when a center preview is supplied. */
	trackAcrossPage?: boolean;
	mode?: BoopOrder;
	/** Overrides the expression pool for the selected mode. */
	payoffs?: readonly Reaction[];
	pinchReaction?: Reaction;
	releaseReaction?: Reaction;
	/** Distance in pixels at which a pending hold yields to a drag. */
	dragThreshold?: number;
	/** Called when an expression is shown. */
	onReact?: (reaction: Reaction) => void;
};

export function Mascot(props: MascotProps) {
	return (
		<MascotButton
			key={JSON.stringify([props.directions, props.reactions, props.preview])}
			{...props}
		/>
	);
}

type ReactionFrame = { at: number; expression: Reaction | null };

function MascotButton({
	directions,
	reactions,
	preview,
	label,
	size = 140,
	className,
	tabIndex,
	trackPointer = true,
	trackAcrossPage = !preview,
	mode = "cycle",
	payoffs,
	pinchReaction = "surprised",
	releaseReaction = "delighted",
	dragThreshold = 5,
	onReact,
}: MascotProps) {
	const buttonRef = useRef<HTMLButtonElement>(null);
	const squashRef = useRef<HTMLSpanElement>(null);
	const playback = useRef({ version: 0, timers: [] as number[] });
	const reactionSheet = useRef<Promise<boolean> | null>(null);
	const animation = useRef<Animation | undefined>(undefined);
	const cycleStep = useRef(0);
	const boops = useRef({ count: 0, at: 0 });
	const directionsReady = useRef(false);
	const [sector, setSector] = useState(-1);
	const [reaction, setReaction] = useState<Reaction | null>(null);

	useEffect(() => {
		const button = buttonRef.current;
		if (!button) return;
		const finePointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
		const reducedMotion = window.matchMedia(REDUCED_MOTION);
		let currentSector = -1;
		let timer: number | undefined;
		let loading = false;
		let retryAfter = 0;
		let disposed = false;
		let unsubscribe: (() => void) | undefined;

		const reset = () => {
			window.clearTimeout(timer);
			timer = undefined;
			currentSector = -1;
			setSector(-1);
		};

		const load = async () => {
			timer = undefined;
			loading = true;
			const loaded = await decodeSheet(directions);
			loading = false;
			if (disposed) return;
			if (!loaded) {
				retryAfter = performance.now() + DIRECTION_RETRY_DELAY;
				return;
			}
			directionsReady.current = true;
			setSector(currentSector);
		};

		const update = (point: { x: number; y: number } | null) => {
			if (!point) {
				reset();
				return;
			}
			const box = button.getBoundingClientRect();
			const deadZone = preview && trackAcrossPage ? 12 : box.width / 3;
			const nextSector = aim(box, point.x, point.y, currentSector, deadZone);
			const changed = nextSector !== currentSector;
			currentSector = nextSector;
			if (!preview || directionsReady.current) {
				if (changed) setSector(currentSector);
			} else if (!trackAcrossPage && currentSector === -1) {
				reset();
			} else if (!loading && timer === undefined && performance.now() >= retryAfter) {
				if (trackAcrossPage) void load();
				else timer = window.setTimeout(load, GAZE_DELAY);
			}
		};

		const moveWithinButton = (event: PointerEvent) => {
			if (event.pointerType !== "touch" && event.buttons === 0) {
				update({ x: event.clientX, y: event.clientY });
			}
		};

		const syncTracking = () => {
			unsubscribe?.();
			unsubscribe = undefined;
			reset();
			if (reducedMotion.matches) {
				animation.current?.cancel();
				if (squashRef.current) squashRef.current.style.transform = "";
			}
			if (!trackPointer || reducedMotion.matches) return;
			if (trackAcrossPage) {
				if (finePointer.matches) unsubscribe = subscribeToPagePointer(update);
			} else {
				button.addEventListener("pointermove", moveWithinButton, { passive: true });
				button.addEventListener("pointerleave", reset);
				unsubscribe = () => {
					button.removeEventListener("pointermove", moveWithinButton);
					button.removeEventListener("pointerleave", reset);
				};
			}
		};

		syncTracking();
		if (trackAcrossPage) finePointer.addEventListener("change", syncTracking);
		reducedMotion.addEventListener("change", syncTracking);
		return () => {
			disposed = true;
			unsubscribe?.();
			finePointer.removeEventListener("change", syncTracking);
			reducedMotion.removeEventListener("change", syncTracking);
			window.clearTimeout(timer);
		};
	}, [directions, preview, trackAcrossPage, trackPointer]);

	useEffect(() => {
		const scheduled = playback.current;
		return () => {
			animation.current?.cancel();
			scheduled.version += 1;
			scheduled.timers.forEach(window.clearTimeout);
		};
	}, []);

	const loadReactions = () => {
		if (!reactionSheet.current) {
			reactionSheet.current = decodeSheet(reactions).then((loaded) => {
				if (!loaded) reactionSheet.current = null;
				return loaded;
			});
		}
		return reactionSheet.current;
	};

	const clearPlayback = () => {
		const scheduled = playback.current;
		scheduled.version += 1;
		scheduled.timers.forEach(window.clearTimeout);
		scheduled.timers = [];
		return scheduled.version;
	};

	const play = async (frames: ReactionFrame[]) => {
		const version = clearPlayback();
		if (!(await loadReactions()) || version !== playback.current.version) return;

		for (const { at, expression } of frames) {
			const show = () => {
				if (version !== playback.current.version) return;
				setReaction(expression);
				if (expression) onReact?.(expression);
			};
			if (at === 0) show();
			else playback.current.timers.push(window.setTimeout(show, at));
		}
	};

	const animate = (keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
		animation.current?.cancel();
		if (!window.matchMedia(REDUCED_MOTION).matches) {
			animation.current = squashRef.current?.animate(keyframes, options);
		}
	};

	const boop = () => {
		const pool = payoffs?.length ? payoffs : mode === "escalate" ? DEFAULT_PAYOFFS : REACTIONS;
		animate(SQUASH, { duration: 420, easing: "linear" });

		if (mode === "escalate") {
			const now = performance.now();
			const streak = boops.current;
			streak.count = now - streak.at < 1600 ? streak.count + 1 : 1;
			streak.at = now;
			if (streak.count >= 4) {
				streak.count = 0;
				void play([
					{ at: 0, expression: "dizzy" },
					{ at: DIZZY_END, expression: null },
				]);
				return;
			}
			// Keep the payoff cycle independent of the rapid-boop counter.
			const next = pool[cycleStep.current++ % pool.length];
			void play([
				{ at: 0, expression: "blink" },
				{ at: 120, expression: next },
				{ at: BOOP_END, expression: null },
			]);
			return;
		}

		const index = mode === "cycle" ? cycleStep.current++ : Math.floor(Math.random() * pool.length);
		void play([
			{ at: 0, expression: pool[index % pool.length] },
			{ at: BOOP_END, expression: null },
		]);
	};

	const gesture = useMascotGesture({
		dragThreshold,
		onPress: preview ? undefined : loadReactions,
		onSqueeze: (pinching) => {
			animation.current?.cancel();
			if (!pinching) animate(PINCH_WOBBLE, { duration: 280, iterations: Infinity });
			void play([
				{ at: 0, expression: pinchReaction },
				{ at: 1400, expression: "dizzy" },
			]);
		},
		onPinchMove: (ratio) => {
			const element = squashRef.current;
			if (!element || window.matchMedia(REDUCED_MOTION).matches) return;
			const x = Math.max(0.7, Math.min(1.3, ratio));
			const y = Math.max(0.7, Math.min(1.3, 1 / ratio));
			element.style.transform = `scale(${x}, ${y})`;
		},
		onRelease: (canceled) => {
			const element = squashRef.current;
			const transform = !canceled && element ? getComputedStyle(element).transform : "none";
			animation.current?.cancel();
			if (element) element.style.transform = "";
			if (canceled) {
				clearPlayback();
				setReaction(null);
				return;
			}
			animate([{ ...PINCH_RELEASE[0], transform }, ...PINCH_RELEASE.slice(1)], {
				duration: 520,
				easing: "linear",
			});
			void play([
				{ at: 0, expression: releaseReaction },
				{ at: 750, expression: null },
			]);
		},
		onBoop: boop,
	});

	const direction = trackPointer && sector !== -1 ? CLOCKWISE_CELLS[sector] : CENTER_CELL;
	const spriteStyle =
		reaction !== null
			? sprite(reactions, REACTIONS.indexOf(reaction))
			: preview && direction === CENTER_CELL
				? sprite(preview)
				: sprite(directions, direction);

	return (
		<button
			ref={buttonRef}
			type="button"
			aria-label={`Boop ${label}`}
			tabIndex={tabIndex}
			className={cn(
				"block shrink-0 cursor-pointer touch-none select-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-ring",
				className,
			)}
			style={{ width: size, height: size }}
			onPointerEnter={(event) => {
				if (!preview && event.pointerType !== "touch") void loadReactions();
			}}
			onFocus={preview ? undefined : loadReactions}
			onContextMenu={(event) => event.preventDefault()}
			{...gesture}
		>
			<span
				ref={squashRef}
				aria-hidden="true"
				className="pointer-events-none relative block size-full origin-[50%_78%]"
			>
				<span className="absolute inset-0 bg-no-repeat" style={spriteStyle} />
			</span>
		</button>
	);
}
