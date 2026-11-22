import { publicSiteUrl } from "@/lib/site";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: publicSiteUrl ? new URL("/sitemap.xml", publicSiteUrl).href : undefined,
	};
}
