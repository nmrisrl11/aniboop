import type { Metadata } from "next";
import localFont from "next/font/local";
import { brand } from "@/lib/brand";
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

const siteUrl = process.env.ANIBOOP_URL;

export const metadata: Metadata = {
	metadataBase: siteUrl ? new URL(siteUrl) : undefined,
	applicationName: brand.name,
	title: { default: brand.title, template: "%s | AniBoop" },
	description: brand.description,
	openGraph: {
		type: "website",
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

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={`${allo.variable} ${inter.variable}`}>
			<body className="min-h-dvh antialiased">{children}</body>
		</html>
	);
}
