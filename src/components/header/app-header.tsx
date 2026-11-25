import {
	CharacterCatalog,
	type CharacterCatalogEntry,
} from "@/components/catalog/character-catalog";
import { Credits } from "@/components/credits/credits";
import { BoopOrderSelect } from "@/components/header/boop-order-select";
import { BrandLogo } from "@/components/header/brand-logo";
import { HeaderOptions } from "@/components/header/header-options";
import { ReactionSoundToggle } from "@/components/header/reaction-sound-toggle";
import { MascotGuide } from "@/components/mascot-guide/mascot-guide";
import type { BoopOrder } from "@/components/mascot/mascot";
import { ResourcesMenu } from "@/components/resources/resources-menu";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import type { GalleryCharacter } from "@/data/characters";
import type { Ref } from "react";

export function AppHeader({
	characters,
	boopOrder,
	onBoopOrderChange,
	soundEnabled,
	onSoundToggle,
	catalogOpen,
	onCatalogOpenChange,
	onSelectCharacter,
	logoRef,
}: {
	characters: readonly CharacterCatalogEntry[];
	boopOrder: BoopOrder;
	onBoopOrderChange: (order: BoopOrder) => void;
	soundEnabled: boolean;
	onSoundToggle: () => void;
	catalogOpen?: boolean;
	onCatalogOpenChange?: (open: boolean) => void;
	onSelectCharacter?: (character: GalleryCharacter) => void;
	logoRef?: Ref<HTMLSpanElement>;
}) {
	return (
		<header className="sticky inset-x-0 top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 shadow-xs select-none sm:px-5 md:h-14">
			<div className="flex items-center gap-2">
				<BrandLogo logoRef={logoRef} />
				<div className="hidden items-center gap-1.5 md:flex">
					<div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
					<div className="flex items-center gap-1">
						<MascotGuide />
						<Credits />
					</div>
					<div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
					<ResourcesMenu />
				</div>
			</div>

			<div className="flex items-center gap-2">
				<div className="hidden md:block">
					<BoopOrderSelect value={boopOrder} onValueChange={onBoopOrderChange} />
				</div>
				<CharacterCatalog
					characters={characters}
					open={catalogOpen}
					onOpenChange={onCatalogOpenChange}
					onSelectCharacter={onSelectCharacter}
				/>
				<div className="hidden md:block">
					<ThemeSwitcher />
				</div>
				<ReactionSoundToggle
					enabled={soundEnabled}
					onToggle={onSoundToggle}
					className="hidden md:inline-flex"
				/>
				<HeaderOptions
					boopOrder={boopOrder}
					onBoopOrderChange={onBoopOrderChange}
					soundEnabled={soundEnabled}
					onSoundToggle={onSoundToggle}
				/>
			</div>
		</header>
	);
}
