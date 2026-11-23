"use client";

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
import { ChevronDownIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const copy = brand.galleryControls;
const icons = { system: MonitorIcon, light: SunIcon, dark: MoonIcon };
const themes = ["system", "light", "dark"] as const;
const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function ThemeSwitcher({
	triggerClassName = "text-muted-foreground",
	showSetting = false,
}: { triggerClassName?: string; showSetting?: boolean } = {}) {
	const { theme, setTheme } = useTheme();
	const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
	const appearance = hydrated && (theme === "light" || theme === "dark") ? theme : "system";
	const ThemeIcon = icons[appearance];

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size={showSetting ? "default" : "icon"}
					className={triggerClassName}
					title={copy.appearance}
					aria-label={`${copy.appearance}, ${copy.themes[appearance]}`}
				>
					<ThemeIcon
						className={showSetting ? "size-4 shrink-0 text-muted-foreground" : undefined}
						aria-hidden="true"
					/>
					{showSetting && (
						<>
							<span className="flex-1 text-left">{copy.appearance}</span>
							<span className="text-xs text-muted-foreground">{copy.themes[appearance]}</span>
							<ChevronDownIcon
								aria-hidden="true"
								className="size-3.5 shrink-0 text-muted-foreground"
							/>
						</>
					)}
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				sideOffset={8}
				collisionPadding={8}
				className="w-max rounded-xl border border-border p-1.5 shadow-lg ring-0 corner-squircle motion-reduce:animate-none"
			>
				<DropdownMenuLabel className="px-2.5">{copy.appearance}</DropdownMenuLabel>
				<DropdownMenuRadioGroup value={appearance} onValueChange={setTheme}>
					{themes.map((option) => {
						const Icon = icons[option];

						return (
							<DropdownMenuRadioItem
								key={option}
								value={option}
								className="min-h-10 gap-2.5 rounded-lg pl-2.5"
							>
								<Icon aria-hidden="true" />
								{copy.themes[option]}
							</DropdownMenuRadioItem>
						);
					})}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
