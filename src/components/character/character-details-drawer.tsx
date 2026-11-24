"use client";

import { Button } from "@/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { ArrowLeftIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

const copy = brand.characterDetails;

export function CharacterDetailsDrawer({
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
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="max-h-[88dvh] overflow-hidden p-0">
				<DrawerHeader className="border-b border-border px-5 pt-3 pb-4">
					{onBackToCatalog && (
						<div className="mb-2">
							<Button
								type="button"
								variant="ghost"
								size="sm"
								onClick={onBackToCatalog}
								className="-ml-2 h-7 gap-1 rounded-lg px-2 text-xs font-semibold text-muted-foreground transition-all duration-160 ease-out hover:bg-muted hover:text-foreground active:scale-95 squircle:rounded-2xl"
							>
								<ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
								Back to catalog
							</Button>
						</div>
					)}
					<div className="flex items-center gap-4">
						<div className="relative size-14 shrink-0 overflow-hidden rounded-2xl border border-border bg-card p-1 shadow-xs corner-squircle squircle:rounded-full">
							<Image
								src={preview}
								alt={brand.galleryControls.portraitAlt(name)}
								width={56}
								height={56}
								unoptimized
								className="aspect-square size-full object-contain"
							/>
						</div>
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<DrawerTitle className="font-heading text-xl font-bold tracking-tight">
									{name}
								</DrawerTitle>
								<span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
									{series}
								</span>
							</div>
							<DrawerDescription className="mt-1 text-xs text-muted-foreground">
								{copy.dialogDescription}
							</DrawerDescription>
						</div>
					</div>
				</DrawerHeader>
				{children}
			</DrawerContent>
		</Drawer>
	);
}
