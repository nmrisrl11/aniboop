"use client";

import { memo } from "react";
import ThiingsGrid, { type ItemConfig } from "./thiings-grid";

const Placeholder = memo(function Placeholder({ index }: { index: number }) {
	return (
		<div
			aria-hidden="true"
			className="absolute inset-1.5 grid place-items-center squircle border bg-card text-sm font-medium text-muted-foreground"
		>
			Placeholder {index + 1}
		</div>
	);
});

function renderPlaceholder({ gridIndex }: ItemConfig) {
	return <Placeholder index={gridIndex} />;
}

export function CharacterGrid() {
	return (
		<ThiingsGrid
			className="focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
			label="Character grid preview"
			describedBy="grid-instructions"
			gridSize={176}
			renderItem={renderPlaceholder}
		/>
	);
}
