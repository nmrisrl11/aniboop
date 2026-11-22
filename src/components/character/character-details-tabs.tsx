"use client";

import { CharacterDirectionsTab } from "./character-directions-tab";
import { CharacterDownloadTab } from "./character-download-tab";
import { CharacterReactionsTab } from "./character-reactions-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";

const copy = brand.characterDetails;

export function CharacterDetailsTabs({
	character,
	onDownload,
}: {
	character: GalleryCharacter;
	onDownload: (url: string, filename: string) => void;
}) {
	return (
		<div className="catalog-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-6 sm:py-5">
			<Tabs defaultValue="directions" className="flex flex-col gap-4">
				<TabsList
					data-vaul-no-drag
					className="grid h-11 w-full grid-cols-3 gap-1 rounded-xl border border-border/50 bg-muted/60 p-1 corner-squircle"
				>
					<TabsTrigger value="directions" className="text-xs sm:text-sm">
						{copy.directions}
					</TabsTrigger>
					<TabsTrigger value="reactions" className="text-xs sm:text-sm">
						{copy.reactions}
					</TabsTrigger>
					<TabsTrigger value="download" className="text-xs sm:text-sm">
						{copy.download}
					</TabsTrigger>
				</TabsList>

				<TabsContent value="directions" className="outline-none">
					<CharacterDirectionsTab character={character} onDownload={onDownload} />
				</TabsContent>

				<TabsContent value="reactions" className="outline-none">
					<CharacterReactionsTab character={character} onDownload={onDownload} />
				</TabsContent>

				<TabsContent value="download" className="outline-none">
					<CharacterDownloadTab character={character} onDownload={onDownload} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
