"use client";

import { Button } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "cn";
import { HeartIcon } from "lucide-react";
import type { ComponentProps } from "react";

const copy = brand.credits;

export function CreditsTrigger({ className, ...props }: ComponentProps<typeof Button>) {
	return (
		<Button
			variant="ghost"
			size="default"
			aria-label={copy.trigger}
			className={cn(
				"h-8 gap-1.5 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground",
				className,
			)}
			{...props}
		>
			<HeartIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
			<span className="flex-1 text-left">{copy.trigger}</span>
		</Button>
	);
}
