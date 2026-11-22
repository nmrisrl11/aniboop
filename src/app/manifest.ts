import { brand } from "@/lib/brand";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "/",
		name: brand.name,
		short_name: brand.name,
		description: brand.description,
		lang: brand.language,
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#fafafa",
		theme_color: "#fafafa",
		icons: [
			{ src: "/icons/aniboop-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
			{ src: "/icons/aniboop-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
			{
				src: "/icons/aniboop-maskable-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
	};
}
