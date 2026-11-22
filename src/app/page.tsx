import { Gallery } from "@/components/gallery/gallery";
import { getGalleryCharacters } from "@/data/characters";
import { brand } from "@/lib/brand";
import { publicSiteUrl } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
	alternates: publicSiteUrl ? { canonical: publicSiteUrl } : undefined,
	keywords: brand.keywords,
	...(publicSiteUrl && { robots: { index: true, follow: true, "max-image-preview": "large" } }),
	openGraph: {
		type: "website",
		url: publicSiteUrl,
		siteName: brand.name,
		title: brand.title,
		description: brand.description,
	},
	twitter: {
		card: "summary_large_image",
		title: brand.title,
		description: brand.description,
	},
};

const websiteJsonLd = publicSiteUrl && {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: brand.name,
	url: publicSiteUrl.origin,
	description: brand.description,
	inLanguage: brand.language,
};

export default async function Home() {
	const characters = await getGalleryCharacters();
	return (
		<>
			{websiteJsonLd && (
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			)}
			<Gallery characters={characters} />
		</>
	);
}
