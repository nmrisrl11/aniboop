"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function ThemeSelect() {
	const { theme, setTheme } = useTheme();
	const hydrated = useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);

	return (
		<label className="flex items-center gap-2 text-sm text-muted-foreground">
			Theme
			<select
				className="min-h-11 rounded-md border border-input bg-card px-2.5 text-card-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
				value={hydrated ? (theme ?? "system") : "system"}
				onChange={(event) => setTheme(event.target.value)}
				disabled={!hydrated}
			>
				<option value="system">System</option>
				<option value="light">Light</option>
				<option value="dark">Dark</option>
			</select>
		</label>
	);
}
