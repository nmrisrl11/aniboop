import { publicSiteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";
import { notFound } from "next/navigation";

export default function sitemap(): MetadataRoute.Sitemap {
	if (!publicSiteUrl) notFound();

	return [{ url: publicSiteUrl.origin }, { url: new URL("/playground", publicSiteUrl).toString() }];
}
