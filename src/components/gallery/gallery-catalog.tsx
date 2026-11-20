import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import type { GalleryCharacter } from "@/data/characters";
import { brand } from "@/lib/brand";
import { Library, X } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

const copy = brand.galleryControls;

export function GalleryCatalog({ characters }: { characters: readonly GalleryCharacter[] }) {
	const groups = useMemo(() => {
		const bySeries = new Map<string, GalleryCharacter[]>();
		for (const character of characters) {
			const members = bySeries.get(character.series);
			if (members) members.push(character);
			else bySeries.set(character.series, [character]);
		}
		return [...bySeries].sort(([a], [b]) => a.localeCompare(b, "en"));
	}, [characters]);
	const characterCount = characters.length;
	const groupCount = groups.length;
	const summary = `${characterCount} ${characterCount === 1 ? "character" : "characters"} across ${groupCount} ${groupCount === 1 ? "group" : "groups"}`;

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="secondary" className="min-h-11" aria-label={`${copy.catalog}, ${summary}`}>
					<Library
						data-icon="inline-start"
						aria-hidden="true"
						className="hidden min-[360px]:block"
					/>
					{copy.catalog}
					<span className="grid aspect-square min-w-6 shrink-0 place-items-center rounded-full bg-card px-1 text-xs leading-none tabular-nums">
						{characterCount}
					</span>
				</Button>
			</DialogTrigger>
			<DialogContent
				showCloseButton={false}
				overlayClassName="bg-background/75 data-open:animate-none data-closed:animate-none supports-backdrop-filter:backdrop-blur-none"
				className="top-auto right-2 bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 mx-auto flex max-h-[min(36rem,calc(100dvh-1rem-env(safe-area-inset-bottom)))] w-auto max-w-lg translate-none flex-col gap-0 overflow-hidden rounded-3xl border bg-card p-0 text-card-foreground shadow-xl ring-0 corner-squircle sm:bottom-[calc(5.25rem+env(safe-area-inset-bottom))] sm:max-h-[min(36rem,calc(100dvh-6rem-env(safe-area-inset-bottom)))] sm:max-w-lg data-open:animate-none data-closed:animate-none"
			>
				<DialogHeader className="flex-row items-start justify-between gap-3 border-b px-4 py-4 sm:px-5">
					<div className="flex flex-col gap-1">
						<DialogTitle className="text-2xl leading-none font-bold">{copy.catalog}</DialogTitle>
						<DialogDescription>{summary}</DialogDescription>
					</div>
					<DialogClose asChild>
						<Button
							variant="ghost"
							size="icon"
							className="size-11 motion-reduce:transition-none"
							aria-label={copy.closeCatalog}
						>
							<X aria-hidden="true" />
						</Button>
					</DialogClose>
				</DialogHeader>
				<div
					tabIndex={0}
					className="catalog-scrollbar min-h-0 overflow-y-auto overscroll-contain px-4 pb-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:px-5"
				>
					{groups.length === 0 && (
						<p className="py-4 text-sm text-muted-foreground">{copy.emptyCatalog}</p>
					)}
					{groups.map(([series, members]) => (
						<section key={series} className="flex flex-col gap-2 border-b py-3 last:border-b-0">
							<h3 className="flex items-baseline justify-between gap-3 text-sm font-semibold">
								{series}
								<span
									aria-hidden="true"
									className="text-xs font-medium text-muted-foreground tabular-nums"
								>
									{members.length}
								</span>
							</h3>
							<ul role="list" className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
								{members.map(({ id, name, preview }) => (
									<li key={id} className="flex items-center gap-2.5 text-sm text-muted-foreground">
										<Image
											src={preview}
											alt=""
											width={36}
											height={36}
											unoptimized
											className="shrink-0 rounded-lg bg-muted corner-squircle"
										/>
										{name}
									</li>
								))}
							</ul>
						</section>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
