"use client";

import { SPLASH_STORAGE_KEY } from "@/lib/splash";
import Image from "next/image";
import { type RefObject, useEffect, useRef, useState } from "react";

type SplashPhase = "idle" | "docking" | "done";

const BOUNCE_FALLBACK_MS = 1150;
const DOCK_DURATION_MS = 400;
const SKIP_DOCK_DURATION_MS = 220;
const HARD_TIMEOUT_MS = 2400;

export function SplashScreen({ targetRef }: { targetRef: RefObject<HTMLElement | null> }) {
	const [phase, setPhase] = useState<SplashPhase>("idle");
	const dockRef = useRef<HTMLDivElement>(null);
	const stageRef = useRef<HTMLDivElement>(null);
	const wobbleRef = useRef<HTMLDivElement>(null);
	const jumpRef = useRef<HTMLDivElement>(null);
	const skipRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const root = document.documentElement;
		const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
		let disposed = false;
		let dockingStarted = false;
		let finished = false;
		let activeGlide: Animation | null = null;
		const timers = new Set<number>();

		const wait = (ms: number) =>
			new Promise<void>((resolve) => {
				const id = window.setTimeout(() => {
					timers.delete(id);
					resolve();
				}, ms);
				timers.add(id);
			});

		const finish = () => {
			if (finished) return;
			finished = true;
			skipRef.current = null;
			delete root.dataset.splash;
			activeGlide?.cancel();
			if (!disposed) setPhase("done");
		};

		if (root.dataset.splash !== "active" || reducedMotionQuery.matches) {
			delete root.dataset.splash;
			queueMicrotask(() => {
				if (!disposed) setPhase("done");
			});
			return () => {
				disposed = true;
			};
		}

		try {
			sessionStorage.setItem(SPLASH_STORAGE_KEY, "1");
		} catch {}

		const handleKeyDown = (event: KeyboardEvent) => {
			if (dockingStarted || finished || disposed) return;
			if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				startDock(SKIP_DOCK_DURATION_MS);
			}
		};

		const startDock = (durationMs: number) => {
			if (dockingStarted || finished || disposed) return;
			dockingStarted = true;
			skipRef.current = null;
			window.removeEventListener("keydown", handleKeyDown);
			setPhase("docking");

			for (const element of [stageRef.current, wobbleRef.current, jumpRef.current]) {
				if (!element) continue;
				for (const animation of element.getAnimations()) {
					animation.cancel();
				}
			}

			const dockElement = dockRef.current;
			const targetElement = targetRef.current;
			if (!dockElement || !targetElement) {
				void wait(260).then(finish);
				return;
			}

			const from = dockElement.getBoundingClientRect();
			const to = targetElement.getBoundingClientRect();
			if (from.width === 0 || to.width === 0) {
				void wait(260).then(finish);
				return;
			}

			const dx = to.left + to.width / 2 - (from.left + from.width / 2);
			const dy = to.top + to.height / 2 - (from.top + from.height / 2);
			const scale = to.width / from.width;

			const glide = dockElement.animate(
				[
					{ transform: "translate3d(0, 0, 0) scale(1)" },
					{ transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})` },
				],
				{
					duration: durationMs,
					easing: "cubic-bezier(0.22, 1, 0.36, 1)",
					fill: "forwards",
				},
			);
			activeGlide = glide;

			void Promise.race([glide.finished.catch(() => {}), wait(durationMs + 80)]).then(finish);
		};

		skipRef.current = () => startDock(SKIP_DOCK_DURATION_MS);

		const handleResize = () => {
			if (dockingStarted) finish();
		};

		const handleReducedMotionChange = (event: MediaQueryListEvent) => {
			if (event.matches) finish();
		};

		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("resize", handleResize);
		reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

		const hardTimeoutId = window.setTimeout(finish, HARD_TIMEOUT_MS);
		timers.add(hardTimeoutId);

		const bounceAnimations = [
			...(jumpRef.current?.getAnimations() ?? []),
			...(wobbleRef.current?.getAnimations() ?? []),
		];

		if (bounceAnimations.length > 0) {
			void Promise.race([
				Promise.allSettled(bounceAnimations.map((animation) => animation.finished)),
				wait(BOUNCE_FALLBACK_MS),
			]).then(() => startDock(DOCK_DURATION_MS));
		} else {
			queueMicrotask(() => startDock(DOCK_DURATION_MS));
		}

		return () => {
			disposed = true;
			skipRef.current = null;
			activeGlide?.cancel();
			for (const id of timers) window.clearTimeout(id);
			timers.clear();
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("resize", handleResize);
			reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
		};
	}, [targetRef]);

	if (phase === "done") return null;

	return (
		<div
			data-phase={phase}
			aria-hidden="true"
			onPointerDown={() => skipRef.current?.()}
			className="aniboop-splash fixed inset-0 z-50 items-center justify-center select-none"
		>
			<div className="aniboop-splash-backdrop fixed inset-0" />
			<div ref={dockRef} className="aniboop-splash-dock relative z-10">
				<div ref={stageRef} className="aniboop-splash-stage">
					<div ref={wobbleRef} className="aniboop-splash-wobble">
						<div ref={jumpRef} className="aniboop-splash-jump">
							<Image
								src="/brand/aniboop-logo.svg"
								alt=""
								width={360}
								height={100}
								loading="eager"
								fetchPriority="high"
								draggable={false}
								className="aspect-90/25 h-auto w-[min(16.875rem,68vw)]"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
