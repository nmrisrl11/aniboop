import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export function RepositoryLink({
	className,
	showLabel = false,
}: { className?: string; showLabel?: boolean } = {}) {
	return (
		<Button
			asChild
			variant="ghost"
			size={showLabel ? "default" : "icon"}
			className={className ?? "text-muted-foreground hover:text-foreground"}
		>
			<a
				href={brand.repositoryUrl}
				aria-label={showLabel ? undefined : `${brand.repositoryLabel} (opens in a new tab)`}
				title={brand.repositoryLabel}
				target="_blank"
				rel="noopener noreferrer"
			>
				<svg
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
					className="size-4 shrink-0 text-muted-foreground"
				>
					<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
					<path d="M9 18c-4.51 2-5-2-7-2" />
				</svg>
				{showLabel && (
					<span className="flex-1 text-left">
						{brand.repositoryLabel}
						<span className="sr-only"> (opens in a new tab)</span>
					</span>
				)}
			</a>
		</Button>
	);
}
