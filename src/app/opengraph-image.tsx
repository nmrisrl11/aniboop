import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "AniBoop. Little characters. Big reactions.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
	const [logo, icon] = await Promise.all([
		readFile(join(process.cwd(), "public/brand/aniboop-logo.svg"), "base64"),
		readFile(join(process.cwd(), "src/app/icon.svg"), "base64"),
	]);

	return new ImageResponse(
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				width: "100%",
				height: "100%",
				padding: 88,
				background: "#fff9f2",
				color: "#21192d",
			}}
		>
			<div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
				{/* oxlint-disable-next-line next/no-img-element -- ImageResponse renders native images. */}
				<img src={`data:image/svg+xml;base64,${logo}`} width={450} height={125} alt="" />
				<div style={{ color: "#6a3bd1", fontSize: 36, fontWeight: 700 }}>{brand.slogan}</div>
			</div>
			{/* oxlint-disable-next-line next/no-img-element -- ImageResponse renders native images. */}
			<img src={`data:image/svg+xml;base64,${icon}`} width={250} height={250} alt="" />
		</div>,
		size,
	);
}
