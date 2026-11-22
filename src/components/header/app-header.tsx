import {
	CharacterCatalog,
	type CharacterCatalogEntry,
} from "@/components/catalog/character-catalog";
import { BoopOrderSelect } from "@/components/header/boop-order-select";
import { HeaderOptions } from "@/components/header/header-options";
import { ReactionSoundToggle } from "@/components/header/reaction-sound-toggle";
import { MascotGuide } from "@/components/mascot-guide/mascot-guide";
import type { BoopOrder } from "@/components/mascot/mascot";
import { CreditsModal } from "@/components/resources/credits-modal";
import { RepositoryLink } from "@/components/resources/repository-link";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import Image from "next/image";

export function AppHeader({
	characters,
	boopOrder,
	onBoopOrderChange,
	soundEnabled,
	onSoundToggle,
	catalogOpen,
	onCatalogOpenChange,
	onSelectCharacter,
}: {
	characters: readonly CharacterCatalogEntry[];
	boopOrder: BoopOrder;
	onBoopOrderChange: (order: BoopOrder) => void;
	soundEnabled: boolean;
	onSoundToggle: () => void;
	catalogOpen?: boolean;
	onCatalogOpenChange?: (open: boolean) => void;
	onSelectCharacter?: (character: GalleryCharacter) => void;
}) {
	return (
		<header className="sticky inset-x-0 top-0 z-20 flex h-16 w-full shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 shadow-xs select-none sm:px-5 md:h-14">
			<div className="flex items-center gap-2">
				<h1 className="shrink-0">
					<Image
						src="/brand/aniboop-logo.svg"
						alt={brand.name}
						title={brand.name}
						width={90}
						height={25}
						priority
						className="aspect-90/25 h-6.25 w-22.5"
					/>
				</h1>
				<div className="hidden items-center gap-2 md:flex">
					<div aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
					<MascotGuide />
					<CreditsModal />
					<RepositoryLink />
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
