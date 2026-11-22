"use client";

import { CharacterDetailsDialog } from "./character-details-dialog";
import { CharacterDetailsDrawer } from "./character-details-drawer";
import { CharacterDetailsTabs } from "./character-details-tabs";
import { useCharacterDownload } from "./use-character-download";
import type { GalleryCharacter } from "@/data/characters";
import { useMediaQuery } from "@/hooks/use-media-query";

export function CharacterDetails({
	character,
	open,
	onOpenChange,
	onBackToCatalog,
}: {
	character: GalleryCharacter | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onBackToCatalog?: () => void;
}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const { handleDownload } = useCharacterDownload();

	if (!character) return null;

	const tabsContent = <CharacterDetailsTabs character={character} onDownload={handleDownload} />;

	if (isDesktop) {
		return (
			<CharacterDetailsDialog
				character={character}
				open={open}
				onOpenChange={onOpenChange}
				onBackToCatalog={onBackToCatalog}
			>
				{tabsContent}
			</CharacterDetailsDialog>
		);
	}

	return (
		<CharacterDetailsDrawer
			character={character}
			open={open}
			onOpenChange={onOpenChange}
			onBackToCatalog={onBackToCatalog}
		>
			{tabsContent}
		</CharacterDetailsDrawer>
	);
}
