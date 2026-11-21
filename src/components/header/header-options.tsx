"use client";

import { BoopOrderSelect } from "@/components/header/boop-order-select";
import { ComponentDocsModal } from "@/components/resources/component-docs-modal";
import { CreditsModal } from "@/components/resources/credits-modal";
import type { BoopOrder } from "@/components/mascot/mascot";
import { RepositoryLink } from "@/components/resources/repository-link";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { brand } from "@/lib/brand";
import { Ellipsis } from "lucide-react";
import { useEffect, useState } from "react";

const optionClass = "h-11 w-full justify-start gap-2.5 px-3 text-sm";
const copy = brand.galleryControls;

export function HeaderOptions({
	boopOrder,
	onBoopOrderChange,
}: {
	boopOrder: BoopOrder;
	onBoopOrderChange: (order: BoopOrder) => void;
}) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open) return;

		const wideLayout = window.matchMedia("(min-width: 48rem)");
		function closeOnWideLayout(event: MediaQueryListEvent) {
			if (event.matches) setOpen(false);
		}
		wideLayout.addEventListener("change", closeOnWideLayout);
		return () => wideLayout.removeEventListener("change", closeOnWideLayout);
	}, [open]);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="size-11 rounded-xl text-muted-foreground md:hidden"
					aria-label={copy.moreOptions}
					title={copy.moreOptions}
				>
					<Ellipsis aria-hidden="true" className="size-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={16}
				collisionPadding={12}
				aria-label={copy.moreOptions}
				className="max-h-(--radix-popover-content-available-height) w-72 max-w-(--radix-popover-content-available-width) gap-0 overflow-y-auto rounded-xl border border-border p-1.5 shadow-lg ring-0 corner-squircle md:hidden data-open:animate-none data-closed:animate-none"
			>
				<div className="flex flex-col gap-0.5 border-b border-border pb-1.5">
					<BoopOrderSelect
						value={boopOrder}
						onValueChange={onBoopOrderChange}
						showSetting
						triggerClassName={optionClass}
					/>
					<ThemeSwitcher showSetting triggerClassName={optionClass} />
				</div>
				<div className="flex flex-col gap-0.5 pt-1.5">
					<ComponentDocsModal triggerClassName={optionClass} />
					<CreditsModal triggerClassName={optionClass} />
					<RepositoryLink showLabel className={optionClass} />
				</div>
			</PopoverContent>
		</Popover>
	);
}
