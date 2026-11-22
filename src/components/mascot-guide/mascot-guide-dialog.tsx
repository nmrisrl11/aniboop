"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { brand } from "@/lib/brand";
import type { ReactNode } from "react";

const copy = brand.componentGuide;

export function MascotGuideDialog({
	trigger,
	children,
}: {
	trigger: ReactNode;
	children: ReactNode;
}) {
	return (
		<Dialog>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent className="max-h-[calc(100dvh-2rem)] max-w-3xl overflow-hidden p-0 sm:max-h-[calc(100dvh-3rem)]">
				<DialogHeader className="border-b border-border bg-muted/30 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 sm:pb-5">
					<DialogTitle className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
						{copy.title}
					</DialogTitle>
					<DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">
						{copy.description}
					</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}
