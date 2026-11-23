"use client";

import { useCallback, useEffect, useState } from "react";

export function useCopy({ timeout = 2000 }: { timeout?: number } = {}) {
	const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
	const copied = status === "copied";
	const failed = status === "failed";

	useEffect(() => {
		if (status === "idle") return;
		const timer = setTimeout(() => setStatus("idle"), timeout);
		return () => clearTimeout(timer);
	}, [status, timeout]);

	const copy = useCallback(async (text: string) => {
		if (typeof window === "undefined" || !navigator?.clipboard) {
			setStatus("failed");
			return false;
		}
		try {
			await navigator.clipboard.writeText(text);
			setStatus("copied");
			return true;
		} catch {
			setStatus("failed");
			return false;
		}
	}, []);

	const reset = useCallback(() => setStatus("idle"), []);

	return { copy, copied, failed, status, reset };
}
