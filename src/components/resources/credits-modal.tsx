"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { brand } from "@/lib/brand";
import { ExternalLink, Heart, LayoutGrid, Pointer, Volume2 } from "lucide-react";

const copy = brand.credits;
const projects = [
	{ ...copy.grid, icon: LayoutGrid },
	{ ...copy.mascot, icon: Pointer },
	{ ...copy.sound, icon: Volume2 },
];

export function CreditsModal({
	triggerClassName = "h-8 gap-1.5 px-2.5 text-xs text-muted-foreground",
}: { triggerClassName?: string } = {}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" size="sm" aria-label={copy.trigger} className={triggerClassName}>
					<Heart aria-hidden="true" />
					{copy.trigger}
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>{copy.title}</DialogTitle>
					<DialogDescription>{copy.description}</DialogDescription>
				</DialogHeader>

				<div className="catalog-scrollbar min-h-0 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-6 sm:pb-6">
					<ul role="list" className="divide-y divide-border border-y border-border">
						{projects.map(({ title, author, description, icon: Icon, href }) => (
							<li key={title}>
								<a
									href={href}
									target="_blank"
									rel="noreferrer"
									className="group grid grid-cols-[auto_1fr_auto] items-start gap-3 px-1 py-4 hover:bg-muted/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
								>
									<span className="grid size-9 place-items-center rounded-lg bg-muted text-muted-foreground corner-squircle">
										<Icon aria-hidden="true" className="size-4" />
									</span>
									<span className="flex min-w-0 flex-col gap-0.5">
										<span className="text-sm font-semibold">{title}</span>
										<span className="text-xs font-medium text-muted-foreground">{author}</span>
										<span className="mt-1 text-sm leading-snug text-muted-foreground">
											{description}
										</span>
									</span>
									<ExternalLink
										aria-hidden="true"
										className="mt-1 size-3.5 text-muted-foreground group-hover:text-foreground"
									/>
								</a>
							</li>
						))}
					</ul>

					<section className="mt-4 flex flex-col gap-1.5 rounded-xl bg-muted/60 p-4 corner-squircle sm:mt-5">
						<h3 className="text-sm font-semibold">{copy.artworkTitle}</h3>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{copy.artworkDescription}
						</p>
					</section>
				</div>
			</DialogContent>
		</Dialog>
	);
}
