import Image from "next/image";
import { ThemeSelect } from "@/components/theme-select";
import { brand } from "@/lib/brand";

export default function Home() {
	return (
		<div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 sm:px-8">
			<header className="flex min-h-20 items-center justify-between gap-4 border-b">
				<div className="flex items-center gap-2.5 font-heading text-2xl font-bold tracking-tight">
					<Image src="/icon.svg" alt="" width={32} height={32} unoptimized />
					{brand.name}
				</div>
				<ThemeSelect />
			</header>

			<main className="grid flex-1 content-center gap-10 py-12 sm:py-16 md:grid-cols-[1fr_0.85fr] md:items-center md:gap-16">
				<div>
					<p className="mb-4 text-sm font-semibold text-primary">{brand.slogan}</p>
					<h1 className="max-w-xl font-heading text-[clamp(2.7rem,7vw,5.5rem)] leading-[0.99] font-bold tracking-tight text-balance">
						{brand.headline}
					</h1>
					<p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
						{brand.intro}
					</p>
				</div>

				<section
					aria-label="Character collection"
					className="flex min-h-70 flex-col items-center justify-center gap-5 squircle border bg-card px-6 py-10 text-center"
				>
					<div className="grid size-36 place-items-center rounded-full bg-boop-lilac">
						<div className="grid size-26 place-items-center rounded-full bg-boop-peach">
							<Image src="/icon.svg" alt="" width={64} height={64} unoptimized />
						</div>
					</div>
					<p className="font-medium text-muted-foreground">
						The character collection is coming soon.
					</p>
				</section>
			</main>
		</div>
	);
}
