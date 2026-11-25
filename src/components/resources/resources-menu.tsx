"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { brand } from "@/lib/brand";
import { cn } from "cn";
import {
	ArrowBigUpIcon,
	ArrowUpRightIcon,
	ChevronDownIcon,
	CoffeeIcon,
	SparklesIcon,
} from "lucide-react";
import type { ComponentProps } from "react";

const copy = brand.resources;
const resourceKeys = ["repository", "support", "upvote"] as const;

function GitHubMark({ className, ...props }: ComponentProps<"svg">) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			className={className}
			{...props}
		>
			<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
			<path d="M9 18c-4.51 2-5-2-7-2" />
		</svg>
	);
}

const icons = {
	repository: GitHubMark,
	support: CoffeeIcon,
	upvote: ArrowBigUpIcon,
};

export function ResourcesMenu({ triggerClassName }: { triggerClassName?: string } = {}) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="default"
					className={cn(
						"h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground",
						triggerClassName,
					)}
				>
					<SparklesIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
					<span>{copy.trigger}</span>
					<ChevronDownIcon
						aria-hidden="true"
						className="size-3.5 shrink-0 text-muted-foreground transition-transform duration-150 group-aria-expanded/button:rotate-180 motion-reduce:transition-none"
					/>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="start"
				sideOffset={8}
				collisionPadding={8}
				className="w-72 max-w-[calc(100vw-1rem)] border border-border p-1.5 shadow-lg ring-0 motion-reduce:animate-none"
			>
				<DropdownMenuLabel className="px-2 pt-1.5 pb-2">{copy.label}</DropdownMenuLabel>
				<DropdownMenuGroup>
					{resourceKeys.map((key) => {
						const Icon = icons[key];
						const { label, description, href } = copy.items[key];

						return (
							<DropdownMenuItem
								key={key}
								asChild
								className="min-h-12 cursor-pointer gap-2.5 px-2 py-1.5"
							>
								<a href={href} target="_blank" rel="noopener noreferrer">
									<span
										aria-hidden="true"
										className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground corner-squircle squircle:rounded-full"
									>
										<Icon />
									</span>
									<span className="flex min-w-0 flex-1 flex-col gap-0.5">
										<span className="leading-tight font-semibold">{label}</span>
										<span className="text-xs leading-snug text-muted-foreground">
											{description}
										</span>
									</span>
									<ArrowUpRightIcon
										aria-hidden="true"
										className="size-3.5 shrink-0 text-muted-foreground"
									/>
									<span className="sr-only"> (opens in a new tab)</span>
								</a>
							</DropdownMenuItem>
						);
					})}
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

export function ResourceLinks({ className }: { className?: string } = {}) {
	return (
		<>
			{resourceKeys.map((key) => {
				const Icon = icons[key];
				const { label, href } = copy.items[key];

				return (
					<Button
						key={key}
						asChild
						variant="ghost"
						size="default"
						className={className ?? "text-muted-foreground hover:text-foreground"}
					>
						<a href={href} target="_blank" rel="noopener noreferrer">
							<Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
							<span className="flex-1 text-left">
								{label}
								<span className="sr-only"> (opens in a new tab)</span>
							</span>
							<ArrowUpRightIcon
								aria-hidden="true"
								className="size-3.5 shrink-0 text-muted-foreground"
							/>
						</a>
					</Button>
				);
			})}
		</>
	);
}
