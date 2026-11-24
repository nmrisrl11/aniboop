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
import { type ReactNode, useRef } from "react";

const copy = brand.galleryControls;

export function CatalogDialog({
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
	const returnFocusRef = useRef<HTMLElement | null>(null);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent
				className="h-168 max-w-3xl"
				onOpenAutoFocus={() => {
					const active = document.activeElement;
					returnFocusRef.current =
						active instanceof HTMLElement && active !== document.body ? active : null;
				}}
				onCloseAutoFocus={(event) => {
					const opener = returnFocusRef.current;
					returnFocusRef.current = null;
					if (!opener?.isConnected) return;
					event.preventDefault();
					opener.focus();
				}}
			>
				<DialogHeader>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
						<DialogTitle>{copy.catalog}</DialogTitle>
						<span
							role="status"
							aria-atomic="true"
							className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium whitespace-nowrap text-muted-foreground tabular-nums"
						>
							{countLabel}
						</span>
					</div>
					<DialogDescription>{copy.catalogDescription}</DialogDescription>
				</DialogHeader>
				{children}
			</DialogContent>
		</Dialog>
	);
}
