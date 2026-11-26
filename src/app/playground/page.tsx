import { Playground } from "@/components/playground/playground";
import { getCatalogCharacters } from "@/data/characters";
import { brand } from "@/lib/brand";
import { publicSiteUrl } from "@/lib/site";
import type { Metadata } from "next";

const copy = brand.playground;
const playgroundUrl = publicSiteUrl ? new URL("/playground", publicSiteUrl) : undefined;

export const metadata: Metadata = {
	title: copy.title,
	description: copy.description,
	alternates: playgroundUrl ? { canonical: playgroundUrl } : undefined,
	openGraph: {
		type: "website",
		url: playgroundUrl,
		siteName: brand.name,
		title: `${copy.title} | ${brand.name}`,
		description: copy.description,
	},
	twitter: {
		card: "summary_large_image",
		title: `${copy.title} | ${brand.name}`,
		description: copy.description,
	},
};

export default function PlaygroundPage() {
	const characters = getCatalogCharacters();
	return <Playground catalog={characters} />;
}
