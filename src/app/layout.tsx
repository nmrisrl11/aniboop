import { ThemeProvider } from "@/components/theme/theme-provider";
import { R2_ASSETS_ORIGIN } from "@/lib/assets";
import { brand } from "@/lib/brand";
import { publicSiteUrl } from "@/lib/site";
import { splashInitScript } from "@/lib/splash";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const allo = localFont({
	src: "./fonts/Allo-Bold.woff2",
	variable: "--font-allo",
	weight: "700",
	display: "swap",
	preload: false,
});

const inter = localFont({
	src: "./fonts/inter-latin-wght-normal.woff2",
	variable: "--font-inter",
	weight: "100 900",
	display: "swap",
	preload: false,
});

export const metadata: Metadata = {
	metadataBase: publicSiteUrl,
	applicationName: brand.name,
	authors: [{ name: brand.author }],
	publisher: brand.name,
	title: { default: brand.title, template: `%s | ${brand.name}` },
	description: brand.description,
	robots: publicSiteUrl ? undefined : { index: false, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang={brand.language}
			className={`${allo.variable} ${inter.variable}`}
			suppressHydrationWarning
		>
			<head>
				{R2_ASSETS_ORIGIN && (
					<>
						<link rel="preconnect" href={R2_ASSETS_ORIGIN} crossOrigin="anonymous" />
						<link rel="dns-prefetch" href={R2_ASSETS_ORIGIN} />
					</>
				)}
				<script dangerouslySetInnerHTML={{ __html: splashInitScript }} />
			</head>
			<body className="min-h-dvh antialiased">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					storageKey="aniboop-appearance"
					enableSystem
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
				<Analytics />
			</body>
		</html>
	);
}
