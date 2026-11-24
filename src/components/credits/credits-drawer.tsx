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

const copy = brand.credits;

export function CreditsDrawer({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
	return (
		<Drawer>
			<DrawerTrigger asChild>{trigger}</DrawerTrigger>
			<DrawerContent className="max-h-[85dvh] overflow-hidden p-0">
				<DrawerHeader className="border-b border-border px-5 pt-3 pr-14 pb-3 text-left sm:px-6 sm:pr-14">
					<DrawerTitle className="font-heading text-xl font-bold tracking-tight">
						{copy.title}
					</DrawerTitle>
					<DrawerDescription className="mt-1 text-xs text-muted-foreground">
						{copy.description}
					</DrawerDescription>
				</DrawerHeader>
				{children}
			</DrawerContent>
		</Drawer>
	);
}
