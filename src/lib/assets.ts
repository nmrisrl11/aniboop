export type SheetQuality = "1080" | "504";

export type SheetType = "directions" | "reactions" | "preview";

const R2_BASE_URL =
	process.env.NEXT_PUBLIC_R2_ASSETS_URL?.trim() || process.env.NEXT_PUBLIC_R2_URL?.trim();

export function getMascotAssetUrl({
	id,
	type,
	quality,
	fallbackUrl,
}: {
	id: string;
	type: SheetType;
	quality: SheetQuality;
	fallbackUrl: string;
}): {
	url: string;
	filename: string;
	isR2: boolean;
	dimensions: string;
} {
	if (type === "preview") {
		return {
			url: fallbackUrl,
			filename: `${id}.webp`,
			isR2: false,
			dimensions: "248 × 248",
		};
	}

	if (quality === "1080") {
		const filename = `${id}-${type}.webp`;
		if (R2_BASE_URL) {
			const cleanBase = R2_BASE_URL.replace(/\/+$/, "");
			return {
				url: `${cleanBase}/sheets/${filename}`,
				filename,
				isR2: true,
				dimensions: "1080 × 1080",
			};
		}

		return {
			url: fallbackUrl,
			filename,
			isR2: false,
			dimensions: "1080 × 1080",
		};
	}

	return {
		url: fallbackUrl,
		filename: `${id}-${type}-504.webp`,
		isR2: false,
		dimensions: "504 × 504",
	};
}
