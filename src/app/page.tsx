import { CharacterGrid } from "@/components/gallery/character-grid";

export default function Home() {
	return (
		<main className="relative h-dvh overflow-hidden">
			<CharacterGrid />
			<p
				id="grid-instructions"
				className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto w-fit rounded-full border bg-card px-3 py-1.5 text-center text-xs text-muted-foreground shadow-sm"
			>
				Drag, scroll, or use arrow keys to explore.
			</p>
		</main>
	);
}
