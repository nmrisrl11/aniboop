"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import dynamic from "next/dynamic";
import { type ComponentProps, useState } from "react";
import { MascotGuideTrigger } from "./mascot-guide-trigger";

const MascotGuideContent = dynamic(
	() => import("./mascot-guide-content").then((mod) => mod.MascotGuideContent),
	{ ssr: false },
);
const MascotGuideDialog = dynamic(
	() => import("./mascot-guide-dialog").then((mod) => mod.MascotGuideDialog),
	{ ssr: false },
);
const MascotGuideDrawer = dynamic(
	() => import("./mascot-guide-drawer").then((mod) => mod.MascotGuideDrawer),
	{ ssr: false },
);

export function MascotGuide({
	triggerClassName,
	onClick,
	...props
}: ComponentProps<typeof MascotGuideTrigger> & { triggerClassName?: string } = {}) {
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [open, setOpen] = useState(false);
	const [hasOpened, setHasOpened] = useState(false);

	const handleOpen: ComponentProps<typeof MascotGuideTrigger>["onClick"] = (event) => {
		onClick?.(event);
		if (!event.defaultPrevented) {
			setHasOpened(true);
			setOpen(true);
		}
	};

	return (
		<>
			<MascotGuideTrigger
				className={triggerClassName}
				aria-haspopup="dialog"
				aria-expanded={open}
				onClick={handleOpen}
				{...props}
			/>
			{hasOpened &&
				(isDesktop ? (
					<MascotGuideDialog open={open} onOpenChange={setOpen}>
						<MascotGuideContent />
					</MascotGuideDialog>
				) : (
					<MascotGuideDrawer open={open} onOpenChange={setOpen}>
						<MascotGuideContent />
					</MascotGuideDrawer>
				))}
		</>
	);
}
