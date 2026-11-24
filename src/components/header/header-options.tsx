"use client";

import { Credits } from "@/components/credits/credits";
import { BoopOrderSelect } from "@/components/header/boop-order-select";
import { ReactionSoundToggle } from "@/components/header/reaction-sound-toggle";
import { MascotGuide } from "@/components/mascot-guide/mascot-guide";
import type { BoopOrder } from "@/components/mascot/mascot";
import { RepositoryLink } from "@/components/resources/repository-link";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { brand } from "@/lib/brand";
import { EllipsisIcon } from "lucide-react";
import { useEffect, useState } from "react";

const optionClass =
	"h-10 w-full justify-start gap-2.5 rounded-md px-2.5 text-sm font-medium text-foreground transition-transform hover:bg-muted active:scale-[0.99] squircle:rounded-xl";
const copy = brand.galleryControls;

export function HeaderOptions({
	boopOrder,
	onBoopOrderChange,
	soundEnabled,
	onSoundToggle,
}: {
	boopOrder: BoopOrder;
	onBoopOrderChange: (order: BoopOrder) => void;
	soundEnabled: boolean;
	onSoundToggle: () => void;
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
					className="size-11 rounded-xl text-muted-foreground md:hidden squircle:rounded-3xl"
					aria-label={copy.moreOptions}
					title={copy.moreOptions}
				>
					<EllipsisIcon aria-hidden="true" className="size-5" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="end"
				sideOffset={8}
				collisionPadding={12}
				aria-label={copy.moreOptions}
				className="max-h-(--radix-popover-content-available-height) w-72 max-w-(--radix-popover-content-available-width) gap-0 overflow-y-auto border border-border p-1.5 shadow-lg ring-0 md:hidden data-open:animate-none data-closed:animate-none"
			>
				<div className="flex flex-col gap-0.5 border-b border-border pb-1.5">
					<BoopOrderSelect
						value={boopOrder}
						onValueChange={onBoopOrderChange}
						showSetting
						triggerClassName={optionClass}
					/>
					<ThemeSwitcher showSetting triggerClassName={optionClass} />
					<ReactionSoundToggle
						enabled={soundEnabled}
						onToggle={onSoundToggle}
						showLabel
						className={optionClass}
					/>
				</div>
				<div className="flex flex-col gap-0.5 pt-1.5">
					<MascotGuide triggerClassName={optionClass} />
					<Credits triggerClassName={optionClass} />
					<RepositoryLink showLabel className={optionClass} />
				</div>
			</PopoverContent>
		</Popover>
	);
}
