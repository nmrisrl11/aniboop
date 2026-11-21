"use client";

import type { BoopOrder } from "@/components/mascot/mascot";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brand } from "@/lib/brand";
import { Flame, Repeat, Shuffle } from "lucide-react";

const copy = brand.galleryControls;
const icons = { cycle: Repeat, random: Shuffle, escalate: Flame };
const orders: readonly BoopOrder[] = ["cycle", "random", "escalate"];

export function BoopOrderSelect({
	value,
	onValueChange,
}: {
	value: BoopOrder;
	onValueChange: (order: BoopOrder) => void;
}) {
	const SelectedIcon = icons[value];

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 gap-1.5 rounded-lg px-2 text-xs font-semibold"
					aria-label={`${copy.boopOrder}, ${copy.orders[value].label}`}
				>
					<SelectedIcon data-icon="inline-start" aria-hidden="true" />
					{copy.orders[value].label}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				collisionPadding={8}
				className="w-64 max-w-[calc(100vw-1rem)] rounded-xl border border-border p-1.5 shadow-lg ring-0 corner-squircle motion-reduce:animate-none"
			>
				<DropdownMenuLabel className="px-2 pt-1.5 pb-2">{copy.boopOrder}</DropdownMenuLabel>
				<DropdownMenuRadioGroup
					value={value}
					onValueChange={(order) => onValueChange(order as BoopOrder)}
				>
					{orders.map((order) => {
						const Icon = icons[order];
						const { label, description } = copy.orders[order];

						return (
							<DropdownMenuRadioItem
								key={order}
								value={order}
								textValue={label}
								className="min-h-12 gap-2.5 rounded-lg py-1.5 pl-2 data-[state=checked]:bg-accent"
							>
								<span
									aria-hidden="true"
									className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground corner-squircle"
								>
									<Icon />
								</span>
								<span className="flex min-w-0 flex-col gap-0.5">
									<span className="leading-tight font-semibold">{label}</span>
									<span className="text-xs leading-snug text-muted-foreground">{description}</span>
								</span>
							</DropdownMenuRadioItem>
						);
					})}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
