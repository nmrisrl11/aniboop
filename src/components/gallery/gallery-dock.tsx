import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { ChevronUp, Flame, Monitor, Moon, Repeat, Shuffle, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { GalleryCatalog } from "./gallery-catalog";
import type { BoopOrder } from "./character-grid";

const orderIcons = { cycle: Repeat, random: Shuffle, escalate: Flame };
const themeIcons = { system: Monitor, light: Sun, dark: Moon };
const orders: readonly BoopOrder[] = ["cycle", "random", "escalate"];
const themes = ["system", "light", "dark"] as const;
const copy = brand.galleryControls;
const menuClass =
	"w-max max-w-[calc(100vw-1rem)] rounded-xl border p-1.5 shadow-lg ring-0 corner-squircle data-open:animate-none data-closed:animate-none";
const itemClass = "min-h-11 gap-2.5 rounded-lg py-2 pr-9 pl-2.5 corner-squircle";

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

export function GalleryDock({
	characters,
	boopOrder,
	onBoopOrderChange,
}: {
	characters: readonly GalleryCharacter[];
	boopOrder: BoopOrder;
	onBoopOrderChange: (order: BoopOrder) => void;
}) {
	const { theme, setTheme } = useTheme();
	const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
	const appearance = hydrated && (theme === "light" || theme === "dark") ? theme : "system";
	const OrderIcon = orderIcons[boopOrder];
	const ThemeIcon = themeIcons[appearance];

	return (
		<footer className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-2 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
			<div
				aria-hidden="true"
				className="absolute inset-x-0 bottom-0 -z-10 h-[calc(100%+4rem)] bg-linear-to-t from-background via-background/80 to-transparent forced-colors:hidden"
			/>
			<nav
				aria-label={copy.label}
				className="pointer-events-auto flex max-w-full items-center gap-0.5 rounded-2xl border bg-card p-1 shadow-sm corner-squircle min-[360px]:gap-1 sm:gap-1.5 sm:p-1.5 motion-reduce:[&_button]:transition-none"
			>
				<h1 className="flex shrink-0 items-center gap-2 border-e px-2 py-1 font-heading text-lg leading-none font-bold sm:px-3">
					<span
						aria-hidden="true"
						className="grid size-5 place-items-center rounded-full bg-boop-lilac text-primary ring-1 ring-primary/30"
					>
						<span className="grid size-3 place-items-center rounded-full border border-current">
							<span className="size-1 rounded-full bg-current" />
						</span>
					</span>
					<span className="sr-only min-[480px]:not-sr-only">{brand.name}</span>
				</h1>

				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="min-h-11"
							aria-label={`${copy.boopOrder}, ${copy.orders[boopOrder].label}`}
						>
							<OrderIcon
								data-icon="inline-start"
								aria-hidden="true"
								className="hidden min-[360px]:block"
							/>
							<span className="flex flex-col items-start gap-0.5 leading-none">
								<span>{copy.boopOrder}</span>
								<span className="text-xs text-muted-foreground">
									{copy.orders[boopOrder].label}
								</span>
							</span>
							<ChevronUp
								data-icon="inline-end"
								aria-hidden="true"
								className="hidden min-[400px]:block"
							/>
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="center"
						side="top"
						sideOffset={12}
						collisionPadding={8}
						className={menuClass}
					>
						<DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
							{copy.boopOrder}
						</DropdownMenuLabel>
						<DropdownMenuRadioGroup
							value={boopOrder}
							onValueChange={(value) => onBoopOrderChange(value as BoopOrder)}
						>
							{orders.map((order) => {
								const Icon = orderIcons[order];
								const { label, description } = copy.orders[order];
								return (
									<DropdownMenuRadioItem
										key={order}
										value={order}
										textValue={label}
										className={itemClass}
									>
										<Icon aria-hidden="true" className="size-4 shrink-0 text-primary" />
										<span className="flex max-w-48 flex-1 flex-col gap-0.5">
											<span className="font-medium">{label}</span>
											<span className="text-xs text-muted-foreground">{description}</span>
										</span>
									</DropdownMenuRadioItem>
								);
							})}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className="size-11"
							title={copy.appearance}
							aria-label={`${copy.appearance}, ${copy.themes[appearance]}`}
						>
							<ThemeIcon aria-hidden="true" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent
						align="center"
						side="top"
						sideOffset={12}
						collisionPadding={8}
						className={menuClass}
					>
						<DropdownMenuLabel className="px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
							{copy.appearance}
						</DropdownMenuLabel>
						<DropdownMenuRadioGroup value={appearance} onValueChange={setTheme}>
							{themes.map((option) => {
								const Icon = themeIcons[option];
								return (
									<DropdownMenuRadioItem key={option} value={option} className={itemClass}>
										<Icon aria-hidden="true" className="size-4 text-primary" />
										<span className="flex-1">{copy.themes[option]}</span>
									</DropdownMenuRadioItem>
								);
							})}
						</DropdownMenuRadioGroup>
					</DropdownMenuContent>
				</DropdownMenu>

				<GalleryCatalog characters={characters} />
			</nav>
			<p id="grid-instructions" className="sr-only">
				{brand.galleryInstructions}
			</p>
		</footer>
	);
}
