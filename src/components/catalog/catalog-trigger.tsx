"use client";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "cn";
import { LibraryIcon } from "lucide-react";
import type { ComponentProps } from "react";

const copy = brand.galleryControls;

export function CatalogTrigger({
	characterCount,
	className,
	...props
}: ComponentProps<typeof Button> & { characterCount: number }) {
	return (
		<Button
			variant="secondary"
			size="sm"
			className={cn(
				"h-11 gap-2 rounded-xl px-3.5 text-sm font-semibold md:h-8 md:rounded-lg md:px-2.5 md:text-xs",
				className,
			)}
			aria-label={`${copy.catalog}, ${copy.characterCount(characterCount)}`}
			aria-keyshortcuts="Control+K Meta+K"
			title={copy.catalog}
			{...props}
		>
			<LibraryIcon data-icon="inline-start" aria-hidden="true" />
			{copy.catalog}
			<span className="hidden h-5 min-w-5 place-items-center rounded-full bg-card px-1.5 text-[10px] font-bold text-foreground tabular-nums shadow-xs md:grid">
				{characterCount}
			</span>
		</Button>
	);
}
