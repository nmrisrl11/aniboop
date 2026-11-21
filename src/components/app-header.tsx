import { BoopOrderSelect } from "@/components/boop-order-select";
import { CharacterCatalog, type CharacterCatalogEntry } from "@/components/character-catalog";
import { ComponentDocsModal } from "@/components/component-docs-modal";
import { CreditsModal } from "@/components/credits-modal";
import type { BoopOrder } from "@/components/mascot/mascot";
import { RepositoryLink } from "@/components/repository-link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { brand } from "@/lib/brand";

export function AppHeader({
	characters,
	boopOrder,
	onBoopOrderChange,
}: {
	characters: readonly CharacterCatalogEntry[];
	boopOrder: BoopOrder;
	onBoopOrderChange: (order: BoopOrder) => void;
}) {
	return (
		<header className="sticky inset-x-0 top-0 z-20 flex h-14 w-full items-center justify-between gap-1 border-b border-border bg-card px-2 shadow-xs select-none min-[360px]:gap-2 min-[420px]:px-3 sm:px-5">
			<div className="flex items-center min-[360px]:gap-1 min-[420px]:gap-1.5 sm:gap-2">
				<h1 className="shrink-0 font-heading text-base font-bold tracking-tight text-foreground">
					{brand.name}
				</h1>
				<div aria-hidden="true" className="mx-1 hidden h-4 w-px bg-border min-[420px]:block" />
				<ComponentDocsModal />
				<CreditsModal />
				<RepositoryLink />
			</div>

			<div className="flex items-center gap-1 min-[420px]:gap-1.5 sm:gap-2">
				<BoopOrderSelect value={boopOrder} onValueChange={onBoopOrderChange} />
				<CharacterCatalog characters={characters} />
				<ThemeSwitcher />
			</div>
		</header>
	);
}
