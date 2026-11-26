import { brand } from "@/lib/brand";
import { publicSiteUrl } from "@/lib/site";

export function GET() {
	const galleryLink = publicSiteUrl ? `- [Character gallery](${publicSiteUrl.origin})\n` : "";
	const playgroundLink = publicSiteUrl
		? `- [Mascot playground](${new URL("/playground", publicSiteUrl).toString()})\n`
		: "";
	const content = `# ${brand.name}

> ${brand.description}

Drag, scroll, or use the arrow keys to pan the gallery. Click, tap, or press Enter or Space on a focused character to boop it. Open Catalog to find characters by name or series, or visit the Playground to preview your own 3 × 3 sprite sheets locally in the browser.

## Links

${galleryLink}${playgroundLink}- [${brand.repositoryLabel}](${brand.repositoryUrl})
`;

	return new Response(content, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
