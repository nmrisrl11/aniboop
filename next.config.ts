import type { NextConfig } from "next";

const securityHeaders = [
	{
		key: "X-Content-Type-Options",
		value: "nosniff",
	},
	{
		key: "X-Frame-Options",
		value: "DENY",
	},
	{
		key: "Referrer-Policy",
		value: "strict-origin-when-cross-origin",
	},
	{
		key: "Permissions-Policy",
		value: "camera=(), geolocation=(), microphone=()",
	},
	{
		key: "Cross-Origin-Opener-Policy",
		value: "same-origin-allow-popups",
	},
	{
		key: "Content-Security-Policy",
		value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
	},
];

const staticPublicCacheHeaders = [
	{
		key: "Cache-Control",
		value: "public, max-age=86400, stale-while-revalidate=604800",
	},
];

const nextConfig: NextConfig = {
	/* config options here */
	cacheComponents: true,
	partialPrefetching: true,
	turbopack: {
		rules: {
			"*.css": {
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css",
			},
		},
	},
	async headers() {
		return [
			{
				source: "/:path*",
				headers: securityHeaders,
			},
			{
				source: "/brand/:path*",
				headers: staticPublicCacheHeaders,
			},
			{
				source: "/icons/:path*",
				headers: staticPublicCacheHeaders,
			},
			{
				source: "/aniboop-watermark.svg",
				headers: staticPublicCacheHeaders,
			},
		];
	},
};

export default nextConfig;
