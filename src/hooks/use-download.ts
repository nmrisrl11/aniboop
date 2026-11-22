"use client";

import { useCallback, useState } from "react";

export function useDownload() {
	const [downloading, setDownloading] = useState(false);

	const downloadFile = useCallback(async (url: string, filename: string) => {
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

	const downloadMultiple = useCallback(
		async (items: readonly { url: string; filename: string }[]) => {
			setDownloading(true);
			try {
				for (const item of items) {
					await downloadFile(item.url, item.filename);
					// Brief pause to prevent browser popup block on multiple downloads
					await new Promise((resolve) => setTimeout(resolve, 250));
				}
			} finally {
				setDownloading(false);
			}
		},
		[downloadFile],
	);

	return { downloadFile, downloadMultiple, downloading };
}
