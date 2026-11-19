type Point = { x: number; y: number };
type Listener = (point: Point | null) => void;

const listeners = new Set<Listener>();
let point: Point | null = null;
let frame = 0;

function move(event: PointerEvent) {
	if (event.pointerType === "touch" || event.buttons !== 0) return;
	point = { x: event.clientX, y: event.clientY };
	if (frame) return;
	frame = requestAnimationFrame(() => {
		frame = 0;
		for (const listener of listeners) listener(point);
	});
}

function cancelPendingMove() {
	cancelAnimationFrame(frame);
	frame = 0;
}

function reset() {
	cancelPendingMove();
	if (!point) return;
	point = null;
	for (const listener of listeners) listener(null);
}

function leave(event: PointerEvent) {
	if (event.relatedTarget === null) reset();
}

export function subscribeToPagePointer(listener: Listener) {
	if (listeners.size === 0) {
		window.addEventListener("pointermove", move, { passive: true });
		// Keep the last displayed gaze during a press. Unpressed movement resumes tracking.
		window.addEventListener("pointerdown", cancelPendingMove, { capture: true, passive: true });
		window.addEventListener("pointerout", leave);
		window.addEventListener("blur", reset);
	}
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
		if (listeners.size > 0) return;
		window.removeEventListener("pointermove", move);
		window.removeEventListener("pointerdown", cancelPendingMove, true);
		window.removeEventListener("pointerout", leave);
		window.removeEventListener("blur", reset);
		reset();
	};
}
