import type { CSSProperties } from "react";

export function getSpriteStyle(sheet: string, cell: number): CSSProperties {
	return {
		backgroundImage: `url(${JSON.stringify(sheet)})`,
		backgroundPosition: `${(cell % 3) * 50}% ${Math.floor(cell / 3) * 50}%`,
		backgroundSize: "300% 300%",
	};
}
