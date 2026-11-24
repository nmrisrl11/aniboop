"use client";

import type { GalleryCharacter } from "@/data/characters";
import { useDownload } from "@/hooks/use-download";
import { useMediaQuery } from "@/hooks/use-media-query";
import { CharacterDetailsContent } from "./character-details-content";
import { CharacterDetailsDialog } from "./character-details-dialog";
import { CharacterDetailsDrawer } from "./character-details-drawer";

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
	const { downloadFile, isDownloading } = useDownload();

	if (!character) return null;

	const content = (
		<CharacterDetailsContent
			character={character}
			onDownload={downloadFile}
			isDownloading={isDownloading}
		/>
	);

	if (isDesktop) {
		return (
			<CharacterDetailsDialog
				character={character}
				open={open}
				onOpenChange={onOpenChange}
				onBackToCatalog={onBackToCatalog}
			>
				{content}
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
			{content}
		</CharacterDetailsDrawer>
	);
}
