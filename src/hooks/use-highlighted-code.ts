import { useEffect, useMemo, useState } from "react";
import type { highlightTsx } from "@/lib/highlighter";

export function useHighlightedCode(code: string) {
	const [highlighted, setHighlighted] = useState<{
		code: string;
		lines: Awaited<ReturnType<typeof highlightTsx>>;
	} | null>(null);
	const plainLines = useMemo(() => code.split("\n"), [code]);

	useEffect(() => {
		let cancelled = false;
		import("@/lib/highlighter")
			.then(({ highlightTsx }) => highlightTsx(code))
			.then((lines) => {
				if (!cancelled) setHighlighted({ code, lines });
			})
			.catch(() => {
				// The plain code stays readable if highlighting fails to load.
			});
		return () => {
			cancelled = true;
		};
	}, [code]);

	return highlighted?.code === code ? highlighted.lines : plainLines;
}
