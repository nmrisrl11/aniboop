"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const copy = brand.characterDetails;

export function CharacterDetailsDialog({
	character,
	open,
	onOpenChange,
	onBackToCatalog,
	children,
}: {
	character: GalleryCharacter;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onBackToCatalog?: () => void;
	children: ReactNode;
}) {
	const { name, series, preview } = character;

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
								className="-ml-2 h-7 gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-all duration-160 ease-out hover:bg-muted hover:text-foreground active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100 squircle:rounded-2xl"
							>
								<ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
								Back to catalog
							</Button>
						</div>
					)}
					<div className="flex items-center gap-4">
						<div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-xs corner-squircle sm:size-18 squircle:rounded-full">
							<Image
								src={preview}
								alt={brand.galleryControls.portraitAlt(name)}
								width={64}
								height={64}
								unoptimized
								className="aspect-square size-full object-contain"
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
				{children}
			</DialogContent>
		</Dialog>
	);
}
