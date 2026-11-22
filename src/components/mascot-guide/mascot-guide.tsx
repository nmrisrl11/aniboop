"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import type { ComponentProps } from "react";
import { MascotGuideContent } from "./mascot-guide-content";
import { MascotGuideDialog } from "./mascot-guide-dialog";
import { MascotGuideDrawer } from "./mascot-guide-drawer";
import { MascotGuideTrigger } from "./mascot-guide-trigger";

export function MascotGuide({
	triggerClassName,
	...props
}: ComponentProps<typeof MascotGuideTrigger> & { triggerClassName?: string } = {}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const trigger = <MascotGuideTrigger className={triggerClassName} {...props} />;

	if (isDesktop) {
		return (
			<MascotGuideDialog trigger={trigger}>
				<MascotGuideContent />
			</MascotGuideDialog>
		);
	}

	return (
		<MascotGuideDrawer trigger={trigger}>
			<MascotGuideContent />
		</MascotGuideDrawer>
	);
}
