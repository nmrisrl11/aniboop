"use client";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { ArrowLeftIcon, RotateCcwIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

type ErrorPageProps = {
	error: unknown;
	reset: () => void;
	retry?: () => void;
};

function getErrorDigest(error: unknown): string | undefined {
	if (error instanceof Error && "digest" in error && typeof error.digest === "string") {
		return error.digest;
	}
	return undefined;
}

export default function ErrorPage({ error, reset, retry }: ErrorPageProps) {
	const copy = brand.statusPages.error;
	const digest = getErrorDigest(error);

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
			<Link
				href="/"
				aria-label={brand.name}
				className="aniboop-logo-trigger inline-block rounded-lg select-none corner-squircle focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-ring squircle:rounded-2xl"
			>
				<span className="aniboop-splash-stage block">
					<span className="aniboop-splash-wobble block">
						<span className="aniboop-splash-jump block">
							<Image
								src="/brand/aniboop-logo.svg"
								alt=""
								aria-hidden="true"
								width={360}
								height={100}
								preload
								draggable={false}
								className="aspect-90/25 h-auto w-[min(16.875rem,68vw)]"
							/>
						</span>
					</span>
				</span>
			</Link>

			<h1 className="mt-8 font-heading text-3xl tracking-tight text-foreground sm:text-4xl">
				{copy.heading}
			</h1>
			<p className="mt-3 max-w-md text-base leading-relaxed text-balance text-muted-foreground sm:text-lg">
				{copy.description}
			</p>
			{digest && (
				<p className="mt-3 font-mono text-xs text-muted-foreground/80 sm:text-sm">
					{copy.digestLabel}: {digest}
				</p>
			)}
			<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
				<Button
					type="button"
					size="lg"
					onClick={() => (retry ?? reset)()}
					className="h-10 px-6 text-sm transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97] sm:text-base"
				>
					<RotateCcwIcon aria-hidden="true" />
					{copy.tryAgain}
				</Button>
				<Button
					asChild
					variant="outline"
					size="lg"
					className="h-10 px-6 text-sm transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97] sm:text-base"
				>
					<Link href="/">
						<ArrowLeftIcon aria-hidden="true" />
						{copy.backHome}
					</Link>
				</Button>
			</div>
		</main>
	);
}
