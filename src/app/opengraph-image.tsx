import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const alt = "AniBoop. Little characters. Big reactions.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
				<div style={{ fontSize: 110, fontWeight: 700, letterSpacing: -5 }}>{brand.name}</div>
				<div style={{ color: "#6a3bd1", fontSize: 36, fontWeight: 700 }}>{brand.slogan}</div>
			</div>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: 250,
					height: 250,
					borderRadius: 72,
					background: "#6a3bd1",
				}}
			>
				<svg width="176" height="176" viewBox="0 0 64 64" aria-hidden="true">
					<circle cx="32" cy="32" r="22" fill="none" stroke="#d0bdf9" strokeWidth="3" />
					<circle cx="32" cy="32" r="14" fill="none" stroke="#f6f3ff" strokeWidth="3" />
					<circle cx="32" cy="32" r="6" fill="#ffdbc5" />
				</svg>
			</div>
		</div>,
		size,
	);
}
