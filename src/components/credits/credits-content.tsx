"use client";

import { CREDITS_PROJECTS } from "@/components/credits/credits-data";
import { brand } from "@/lib/brand";
import { ExternalLinkIcon, UserStarIcon } from "lucide-react";

const copy = brand.credits;

export function CreditsContent() {
	return (
		<div className="catalog-scrollbar flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto overscroll-contain p-4 sm:p-5">
			<ul role="list" className="flex flex-col gap-1.5">
				{CREDITS_PROJECTS.map(({ title, author, description, icon: Icon, href }) => (
					<li key={title}>
						<a
							href={href}
							target="_blank"
							rel="noreferrer"
							className="group relative flex items-start gap-3.5 rounded-xl border border-transparent p-3 transition-all duration-160 ease-out corner-squircle hover:border-border hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-ring active:scale-[0.99] squircle:rounded-3xl"
						>
							<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground transition-colors duration-160 corner-squircle group-hover:bg-primary/10 group-hover:text-primary squircle:rounded-full">
								<Icon className="size-4.5" aria-hidden="true" />
							</div>

							<div className="flex min-w-0 flex-1 flex-col">
								<div className="flex items-center justify-between gap-2">
									<div className="flex min-w-0 flex-wrap items-center gap-1.5">
										<span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
											{title}
										</span>
										<span className="text-xs text-muted-foreground">by {author}</span>
									</div>
									<ExternalLinkIcon
										aria-hidden="true"
										className="size-3.5 shrink-0 text-muted-foreground/50 transition-all duration-160 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground"
									/>
								</div>
								<p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
							</div>
						</a>
					</li>
				))}
			</ul>

			<section className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 corner-squircle sm:p-4 dark:bg-input/30 squircle:rounded-3xl">
				<UserStarIcon className="size-3.5 text-foreground" aria-hidden="true" />

				<div className="flex-1 space-y-1">
					<h3 className="text-xs font-semibold text-foreground">{copy.artworkTitle}</h3>
					<p className="text-xs leading-relaxed text-muted-foreground">{copy.artworkDescription}</p>
				</div>
			</section>
		</div>
	);
}
