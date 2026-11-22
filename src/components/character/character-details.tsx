"use client";

import type { GalleryCharacter } from "@/data/characters";
import { useDownload } from "@/hooks/use-download";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CharacterDetailsDialog } from "./character-details-dialog";
import { CharacterDetailsDrawer } from "./character-details-drawer";
import { CharacterDetailsTabs } from "./character-details-tabs";

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
	const { downloadFile } = useDownload();

	if (!character) return null;

	const tabsContent = <CharacterDetailsTabs character={character} onDownload={downloadFile} />;

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
