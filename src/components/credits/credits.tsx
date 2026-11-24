"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import dynamic from "next/dynamic";
import { type ComponentProps, useState } from "react";
import { CreditsTrigger } from "./credits-trigger";

const CreditsContent = dynamic(
	() => import("./credits-content").then((mod) => mod.CreditsContent),
	{ ssr: false },
);
const CreditsDialog = dynamic(() => import("./credits-dialog").then((mod) => mod.CreditsDialog), {
	ssr: false,
});
const CreditsDrawer = dynamic(() => import("./credits-drawer").then((mod) => mod.CreditsDrawer), {
	ssr: false,
});

export function Credits({
	triggerClassName,
	onClick,
	...props
}: ComponentProps<typeof CreditsTrigger> & { triggerClassName?: string } = {}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	const handleOpen: ComponentProps<typeof CreditsTrigger>["onClick"] = (event) => {
		onClick?.(event);
		if (!event.defaultPrevented) {
			setHasOpened(true);
			setOpen(true);
		}
	};

	return (
		<>
			<CreditsTrigger
				className={triggerClassName}
				aria-haspopup="dialog"
				aria-expanded={open}
				onClick={handleOpen}
				{...props}
			/>
			{hasOpened &&
				(isDesktop ? (
					<CreditsDialog open={open} onOpenChange={setOpen}>
						<CreditsContent />
					</CreditsDialog>
				) : (
					<CreditsDrawer open={open} onOpenChange={setOpen}>
						<CreditsContent />
					</CreditsDrawer>
				))}
		</>
	);
}

// Backward compatibility alias for previous import names
export { Credits as CreditsModal };
