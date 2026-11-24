"use client";

import { useCallback, useRef, useState } from "react";

const BLOB_REVOKE_DELAY_MS = 5000;

export type DownloadOptions = {
	fallbackUrl?: string;
};

function triggerBlobDownload(blob: Blob, filename: string) {
	const blobUrl = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = blobUrl;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	// Defer revocation so mobile browsers (especially iOS Safari) can read the blob before cleanup.
	window.setTimeout(() => URL.revokeObjectURL(blobUrl), BLOB_REVOKE_DELAY_MS);
}

async function fetchValidBlob(url: string): Promise<Blob> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch asset (${response.status})`);
	}
	return response.blob();
}

export function useDownload() {
	const [activeUrls, setActiveUrls] = useState<ReadonlySet<string>>(() => new Set());
	const inFlightRef = useRef<Set<string>>(new Set());

	const markDownloading = useCallback((url: string, active: boolean) => {
		if (active) {
			inFlightRef.current.add(url);
		} else {
			inFlightRef.current.delete(url);
		}
		setActiveUrls(new Set(inFlightRef.current));
	}, []);

	const isDownloading = useCallback((url: string) => activeUrls.has(url), [activeUrls]);

	const downloadFile = useCallback(
		async (url: string, filename: string, options?: DownloadOptions) => {
			if (inFlightRef.current.has(url)) return false;
			markDownloading(url, true);
			try {
				const blob = await fetchValidBlob(url);
				triggerBlobDownload(blob, filename);
				return true;
			} catch {
				const fallbackUrl = options?.fallbackUrl;
				if (fallbackUrl && fallbackUrl !== url) {
					try {
						const fallbackBlob = await fetchValidBlob(fallbackUrl);
						triggerBlobDownload(fallbackBlob, filename);
						return true;
					} catch {
						// Fall through to opening the URL directly.
					}
				}
				window.open(fallbackUrl || url, "_blank", "noopener,noreferrer");
				return false;
			} finally {
				markDownloading(url, false);
			}
		},
		[markDownloading],
	);

	const downloadText = useCallback((content: string, filename: string, mimeType = "text/plain") => {
		const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
		triggerBlobDownload(blob, filename);
	}, []);

	const downloadMultiple = useCallback(
		async (items: readonly { url: string; filename: string; fallbackUrl?: string }[]) => {
			for (const item of items) {
				await downloadFile(item.url, item.filename, { fallbackUrl: item.fallbackUrl });
				// Brief pause to prevent browser popup block on multiple downloads
				await new Promise((resolve) => window.setTimeout(resolve, 250));
			}
		},
		[downloadFile],
	);

	return {
		downloadFile,
		downloadText,
		downloadMultiple,
		isDownloading,
		downloading: activeUrls.size > 0,
	};
}
