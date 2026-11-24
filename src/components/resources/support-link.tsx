import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { CoffeeIcon } from "lucide-react";

export function SupportLink({
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
				href={brand.supportUrl}
				aria-label={showLabel ? undefined : `${brand.supportLabel} (opens in a new tab)`}
				title={brand.supportLabel}
				target="_blank"
				rel="noopener noreferrer"
			>
				<CoffeeIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
				{showLabel && (
					<span className="flex-1 text-left">
						{brand.supportLabel}
						<span className="sr-only"> (opens in a new tab)</span>
					</span>
				)}
			</a>
		</Button>
	);
}
