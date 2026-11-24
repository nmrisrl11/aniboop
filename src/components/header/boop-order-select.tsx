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
import { ChevronDownIcon, FlameIcon, RepeatIcon, ShuffleIcon } from "lucide-react";

const copy = brand.galleryControls;
const icons = { cycle: RepeatIcon, random: ShuffleIcon, escalate: FlameIcon };
const orders: readonly BoopOrder[] = ["cycle", "random", "escalate"];

export function BoopOrderSelect({
	value,
	onValueChange,
	triggerClassName = "h-8 gap-1.5 px-2 text-xs font-semibold",
	showSetting = false,
}: {
	value: BoopOrder;
	onValueChange: (order: BoopOrder) => void;
	triggerClassName?: string;
	showSetting?: boolean;
}) {
	const SelectedIcon = icons[value];

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size={showSetting ? "default" : "sm"}
					className={triggerClassName}
					aria-label={`${copy.boopOrder}, ${copy.orders[value].label}`}
				>
					<SelectedIcon
						className={showSetting ? "size-4 shrink-0 text-muted-foreground" : undefined}
						data-icon={showSetting ? undefined : "inline-start"}
						aria-hidden="true"
					/>
					{showSetting ? (
						<>
							<span className="flex-1 text-left">{copy.boopOrder}</span>
							<span className="text-xs text-muted-foreground">{copy.orders[value].label}</span>
							<ChevronDownIcon
								aria-hidden="true"
								className="size-3.5 shrink-0 text-muted-foreground"
							/>
						</>
					) : (
						<span className="grid">
							{orders.map((order) => (
								<span
									key={order}
									aria-hidden={order !== value || undefined}
									className="col-start-1 row-start-1 aria-hidden:invisible"
								>
									{copy.orders[order].label}
								</span>
							))}
						</span>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				collisionPadding={8}
				className="w-64 max-w-[calc(100vw-1rem)] border border-border p-1.5 shadow-lg ring-0 motion-reduce:animate-none"
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
								className="min-h-12 gap-2.5 py-1.5 pl-2 data-[state=checked]:not-focus:bg-secondary"
							>
								<span
									aria-hidden="true"
									className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground corner-squircle squircle:rounded-full"
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
