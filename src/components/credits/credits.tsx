"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import type { ComponentProps } from "react";
import { CreditsContent } from "./credits-content";
import { CreditsDialog } from "./credits-dialog";
import { CreditsDrawer } from "./credits-drawer";
import { CreditsTrigger } from "./credits-trigger";

export function Credits({
	triggerClassName,
	...props
}: ComponentProps<typeof CreditsTrigger> & { triggerClassName?: string } = {}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const trigger = <CreditsTrigger className={triggerClassName} {...props} />;

	if (isDesktop) {
		return (
			<CreditsDialog trigger={trigger}>
				<CreditsContent />
			</CreditsDialog>
		);
	}

	return (
		<CreditsDrawer trigger={trigger}>
			<CreditsContent />
		</CreditsDrawer>
	);
}

// Backward compatibility alias for previous import names
export { Credits as CreditsModal };
