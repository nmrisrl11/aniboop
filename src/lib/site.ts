function getPublicSiteUrl(): URL | undefined {
	const configuredUrl = process.env.ANIBOOP_URL?.trim();
	const vercelEnvironment = process.env.VERCEL_ENV;

	if (
		!configuredUrl ||
		process.env.NODE_ENV !== "production" ||
		(vercelEnvironment && vercelEnvironment !== "production")
	) {
		return undefined;
	}

	const url = URL.parse(configuredUrl);
	if (!url || !/^https?:\/\/[^/?#@\\\s]+\/?$/i.test(configuredUrl)) {
		throw new Error("ANIBOOP_URL must be an absolute HTTP(S) origin, such as https://example.com.");
	}

	return url;
}

export const publicSiteUrl = getPublicSiteUrl();
