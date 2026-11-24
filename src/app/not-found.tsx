import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
	title: brand.statusPages.notFound.title,
};

export default function NotFound() {
	const copy = brand.statusPages.notFound;

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
			<Button
				asChild
				size="lg"
				className="mt-8 h-10 px-6 text-sm transition-[color,background-color,transform] duration-150 ease-out active:scale-[0.97] sm:text-base"
			>
				<Link href="/">
					<ArrowLeftIcon aria-hidden="true" />
					{copy.action}
				</Link>
			</Button>
		</main>
	);
}
