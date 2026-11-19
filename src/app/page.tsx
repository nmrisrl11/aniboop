import { CharacterGrid } from "@/components/gallery/character-grid";
import { getGalleryCharacters } from "@/data/characters";
import { brand } from "@/lib/brand";

export default async function Home() {
	const characters = await getGalleryCharacters();
	return (
		<main className="relative h-dvh overflow-hidden">
			<CharacterGrid characters={characters} />
			<p
				id="grid-instructions"
				className="pointer-events-none absolute inset-x-4 bottom-4 mx-auto w-fit rounded-full border bg-card px-3 py-1.5 text-center text-xs text-muted-foreground shadow-sm"
			>
				{brand.galleryInstructions}
			</p>
		</main>
	);
}
