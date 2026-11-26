import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { FlaskConicalIcon } from "lucide-react";
import Link from "next/link";

const copy = brand.playground;

export function PlaygroundLink({ className }: { className?: string }) {
	return (
		<Button
			asChild
			variant="ghost"
			size="default"
			className={cn(
				"h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground",
				className,
			)}
		>
			<Link href="/playground">
				<FlaskConicalIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
				<span className="flex-1 text-left">{copy.trigger}</span>
			</Link>
		</Button>
	);
}
