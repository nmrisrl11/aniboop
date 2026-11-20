import { Gallery } from "@/components/gallery/gallery";
import { getGalleryCharacters } from "@/data/characters";

export default async function Home() {
	const characters = await getGalleryCharacters();
	return <Gallery characters={characters} />;
}
