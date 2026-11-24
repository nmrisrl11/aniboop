import { Gallery } from "@/components/gallery/gallery";
import { getCatalogCharacters } from "@/data/characters";
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

export default function Home() {
	const characters = getCatalogCharacters();
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
			<Gallery catalog={characters} />
		</>
	);
}
