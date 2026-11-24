"use client";

import { brand } from "@/lib/brand";
import Image from "next/image";
import { type Ref, useRef } from "react";

const LOGO_BOOP_DURATION_MS = 420;

export function BrandLogo({ logoRef }: { logoRef?: Ref<HTMLSpanElement> }) {
	const boopRef = useRef<HTMLSpanElement>(null);
	const tiltDirectionRef = useRef(-1);

	const handleBoop = () => {
		const element = boopRef.current;
		if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		tiltDirectionRef.current *= -1;
		const direction = tiltDirectionRef.current;

		for (const animation of element.getAnimations()) {
			animation.cancel();
		}

		element.animate(
			[
				{ transform: "translate3d(0, 0, 0) rotate(0deg) scale(1, 1)" },
				{
					offset: 0.2,
					transform: `translate3d(0, 1px, 0) rotate(${direction * -4}deg) scale(1.13, 0.85)`,
				},
				{
					offset: 0.5,
					transform: `translate3d(0, -5px, 0) rotate(${direction * 6}deg) scale(0.95, 1.14)`,
				},
				{
					offset: 0.8,
					transform: `translate3d(0, 0.5px, 0) rotate(${direction * -2.5}deg) scale(1.08, 0.9)`,
				},
				{ transform: "translate3d(0, 0, 0) rotate(0deg) scale(1, 1)" },
			],
			{
				duration: LOGO_BOOP_DURATION_MS,
				easing: "ease-in-out",
			},
		);
	};

	return (
		<h1 className="shrink-0">
			<button
				type="button"
				onClick={handleBoop}
				title={brand.name}
				className="aniboop-logo-trigger flex items-center rounded-lg corner-squircle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring squircle:rounded-xl"
			>
				<span className="sr-only">{brand.name}</span>
				<span ref={logoRef} data-header-logo="" className="block h-6.25 w-22.5">
					<span ref={boopRef} className="aniboop-logo-boop block size-full">
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
					</span>
				</span>
			</button>
		</h1>
	);
}
