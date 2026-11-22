"use client";

import { useCallback } from "react";

export function useCharacterDownload() {
	const handleDownload = useCallback(async (url: string, filename: string) => {
		try {
			const response = await fetch(url);
			const blob = await response.blob();
			const blobUrl = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = blobUrl;
			link.download = filename;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			URL.revokeObjectURL(blobUrl);
		} catch {
			window.open(url, "_blank");
		}
	}, []);

	return { handleDownload };
}
