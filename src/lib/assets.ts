export type SheetQuality = "1080" | "504";

export type SheetType = "directions" | "reactions" | "preview";

const RAW_R2_BASE_URL =
	process.env.NEXT_PUBLIC_R2_ASSETS_URL?.trim() || process.env.NEXT_PUBLIC_R2_URL?.trim() || "";

export const R2_ASSETS_ORIGIN = RAW_R2_BASE_URL.replace(/\/+$/, "");

function appendVersion(url: string, version?: string): string {
	if (!version) return url;
	return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}`;
}

export function getGalleryAssetUrls(
	id: string,
	version?: string,
): {
	preview: string;
	galleryDirections: string;
	reactions: string;
} {
	const base = R2_ASSETS_ORIGIN || "/mascots";
	return {
		preview: appendVersion(`${base}/previews/${id}.webp`, version),
		galleryDirections: appendVersion(`${base}/gallery-sheets/${id}-directions.webp`, version),
		reactions: appendVersion(`${base}/gallery-sheets/${id}-reactions.webp`, version),
	};
}

export function getMascotAssetUrl({
	id,
	type,
	quality,
	version,
	fallbackUrl,
}: {
	id: string;
	type: SheetType;
	quality: SheetQuality;
	version?: string;
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
			isR2: Boolean(R2_ASSETS_ORIGIN),
			dimensions: "248 × 248",
		};
	}

	if (quality === "1080") {
		const filename = `${id}-${type}.webp`;
		if (R2_ASSETS_ORIGIN) {
			return {
				url: appendVersion(`${R2_ASSETS_ORIGIN}/sheets/${filename}`, version),
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
		isR2: Boolean(R2_ASSETS_ORIGIN),
		dimensions: "504 × 504",
	};
}
