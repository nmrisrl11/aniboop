"use client";

import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { brand } from "@/lib/brand";
import type { ReactNode } from "react";

const copy = brand.galleryControls;

export function CatalogDrawer({
	open,
	onOpenChange,
	trigger,
	countLabel,
	children,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	trigger: ReactNode;
	countLabel: string;
	children: ReactNode;
}) {
	return (
		<Drawer open={open} onOpenChange={onOpenChange}>
			<DrawerTrigger asChild>{trigger}</DrawerTrigger>
			<DrawerContent className="max-h-[88dvh] overflow-hidden p-0">
				<DrawerHeader className="px-4 pt-3 pr-14 pb-2 sm:px-6 sm:pr-14">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
						<DrawerTitle>{copy.catalog}</DrawerTitle>
						<span
							role="status"
							aria-atomic="true"
							className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground tabular-nums"
						>
							{countLabel}
						</span>
					</div>
					<DrawerDescription>{copy.catalogDescription}</DrawerDescription>
				</DrawerHeader>
				{children}
			</DrawerContent>
		</Drawer>
	);
}
