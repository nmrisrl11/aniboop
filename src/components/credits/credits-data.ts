import { brand } from "@/lib/brand";
import { LayoutGrid, Pointer, Volume2, type LucideIcon } from "lucide-react";

export interface CreditProject {
	readonly title: string;
	readonly author: string;
	readonly href: string;
	readonly description: string;
	readonly icon: LucideIcon;
}

const copy = brand.credits;

export const CREDITS_PROJECTS: readonly CreditProject[] = [
	{ ...copy.grid, icon: LayoutGrid },
	{ ...copy.mascot, icon: Pointer },
	{ ...copy.sound, icon: Volume2 },
];
