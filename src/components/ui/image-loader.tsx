// Adapted from Generative Loaders (MIT). See THIRD_PARTY_NOTICES.txt.
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

export type BloomImageLoaderProps = {
	className?: string;
	/** Optional animation phase offset in milliseconds for staggered grids. */
	delayMs?: number;
	/** Accessible status label. Omit when decorative or inside repeated gallery tiles. */
	label?: string;
};

export function BloomImageLoader({ className, delayMs, label }: BloomImageLoaderProps) {
	const style =
		delayMs !== undefined && delayMs !== 0
			? ({ "--bloom-delay": `${delayMs}ms` } as CSSProperties)
			: undefined;

	return (
		<span
			role={label ? "status" : undefined}
			aria-label={label}
			aria-hidden={label ? undefined : true}
			className={cn("bloom-loader relative block size-full text-primary", className)}
			style={style}
		>
			<span className="bloom-visual" aria-hidden="true">
				<span className="bloom-ring" />
				<span className="bloom-orb" />
				<span className="bloom-core" />
			</span>
		</span>
	);
}
