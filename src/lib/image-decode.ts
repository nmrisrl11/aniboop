const MAX_LOW_PRIORITY_CONCURRENT = 4;

export type DecodePriority = "high" | "low";

export type DecodeImageOptions = {
	priority?: DecodePriority;
	signal?: AbortSignal;
};

type QueuedDecode = {
	url: string;
	signal?: AbortSignal;
	resolve: (decoded: boolean) => void;
	onAbort?: () => void;
};

const decodedImages = new Set<string>();
const pendingImages = new Map<string, Promise<boolean>>();
const lowPriorityQueue: QueuedDecode[] = [];
let activeLowPriority = 0;

export function isImageDecoded(url: string) {
	return decodedImages.has(url);
}

function startDecode(url: string, priority: DecodePriority): Promise<boolean> {
	const existing = pendingImages.get(url);
	if (existing) return existing;

	const image = new Image();
	image.decoding = "async";
	if ("fetchPriority" in image) {
		image.fetchPriority = priority === "low" ? "low" : "auto";
	}
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
		.finally(() => {
			pendingImages.delete(url);
		});

	pendingImages.set(url, decoded);
	return decoded;
}

function drainLowPriorityQueue() {
	while (activeLowPriority < MAX_LOW_PRIORITY_CONCURRENT && lowPriorityQueue.length > 0) {
		const task = lowPriorityQueue.shift();
		if (!task) break;
		if (task.signal && task.onAbort) {
			task.signal.removeEventListener("abort", task.onAbort);
		}
		if (task.signal?.aborted) {
			task.resolve(false);
			continue;
		}
		if (decodedImages.has(task.url)) {
			task.resolve(true);
			continue;
		}

		activeLowPriority += 1;
		void startDecode(task.url, "low")
			.then(task.resolve)
			.finally(() => {
				activeLowPriority -= 1;
				drainLowPriorityQueue();
			});
	}
}

export function decodeImage(url: string, options?: DecodeImageOptions): Promise<boolean> {
	const priority = options?.priority ?? "high";
	const signal = options?.signal;

	if (decodedImages.has(url)) return Promise.resolve(true);
	if (signal?.aborted) return Promise.resolve(false);

	const pending = pendingImages.get(url);
	if (pending) return pending;

	if (priority === "high") {
		return startDecode(url, "high");
	}

	return new Promise<boolean>((resolve) => {
		const task: QueuedDecode = { url, signal, resolve };
		if (signal) {
			const onAbort = () => {
				const index = lowPriorityQueue.indexOf(task);
				if (index !== -1) {
					lowPriorityQueue.splice(index, 1);
					resolve(false);
				}
			};
			task.onAbort = onAbort;
			signal.addEventListener("abort", onAbort, { once: true });
		}
		lowPriorityQueue.push(task);
		drainLowPriorityQueue();
	});
}
