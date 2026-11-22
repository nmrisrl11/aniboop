import { ThemeProvider } from "@/components/theme/theme-provider";
import { brand } from "@/lib/brand";
import { publicSiteUrl } from "@/lib/site";
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
			</body>
		</html>
	);
}
