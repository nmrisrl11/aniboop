const decodedImages = new Set<string>();
const pendingImages = new Map<string, Promise<boolean>>();

export function isImageDecoded(url: string) {
	return decodedImages.has(url);
}

export function decodeImage(url: string): Promise<boolean> {
	if (decodedImages.has(url)) return Promise.resolve(true);

	const pending = pendingImages.get(url);
	if (pending) return pending;

	const image = new Image();
	image.src = url;
	const decoded = image
		.decode()
		.then(
			() => {
				decodedImages.add(url);
				return true;
			},
			() => false,
		)
		.finally(() => pendingImages.delete(url));
	pendingImages.set(url, decoded);
	return decoded;
}
