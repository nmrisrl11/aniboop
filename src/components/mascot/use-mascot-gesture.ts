import { type MouseEvent, type PointerEvent, useEffect, useRef } from "react";

const HOLD_DELAY = 220;

type Point = { x: number; y: number };
type Gesture = {
	pointers: Map<number, Point>;
	origin: Point;
	holdTimer?: number;
	phase: "pending" | "holding" | "pinching" | "consumed" | "dragging";
	pinchDistance: number;
};

function point(event: PointerEvent<HTMLButtonElement>): Point {
	return { x: event.clientX, y: event.clientY };
}

function distance(a: Point, b: Point) {
	return Math.hypot(a.x - b.x, a.y - b.y);
}

export function useMascotGesture({
	dragThreshold,
	onPress,
	onSqueeze,
	onPinchMove,
	onRelease,
	onBoop,
}: {
	dragThreshold: number;
	onPress?: () => void;
	onSqueeze: (pinching: boolean) => void;
	onPinchMove: (ratio: number) => void;
	onRelease: (canceled: boolean) => void;
	onBoop: () => void;
}) {
	const gestureRef = useRef<Gesture | null>(null);
	const suppressClick = useRef(false);

	useEffect(() => () => window.clearTimeout(gestureRef.current?.holdTimer), []);

	const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
		if (event.button !== 0) return;
		const current = gestureRef.current;
		const next = point(event);
		if (current) {
			if (
				event.pointerType !== "touch" ||
				event.isPrimary ||
				(current.phase !== "pending" && current.phase !== "holding") ||
				current.pointers.size !== 1
			)
				return;
			const [first] = current.pointers.values();
			current.pointers.set(event.pointerId, next);
			current.pinchDistance = Math.max(1, distance(first, next));
			window.clearTimeout(current.holdTimer);
			current.phase = "pinching";
			suppressClick.current = true;
			event.currentTarget.setPointerCapture(event.pointerId);
			onSqueeze(true);
			return;
		}
		if (!event.isPrimary) return;

		suppressClick.current = false;
		const gesture: Gesture = {
			pointers: new Map([[event.pointerId, next]]),
			origin: next,
			phase: "pending",
			pinchDistance: 1,
		};
		gestureRef.current = gesture;
		event.currentTarget.setPointerCapture(event.pointerId);
		onPress?.();
		gesture.holdTimer = window.setTimeout(() => {
			gesture.phase = "holding";
			suppressClick.current = true;
			onSqueeze(false);
		}, HOLD_DELAY);
	};

	const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
		const gesture = gestureRef.current;
		if (!gesture?.pointers.has(event.pointerId)) return;

		const next = point(event);
		gesture.pointers.set(event.pointerId, next);
		if (gesture.phase === "pending" && distance(next, gesture.origin) >= dragThreshold) {
			window.clearTimeout(gesture.holdTimer);
			gesture.phase = "dragging";
			suppressClick.current = true;
			return;
		}
		if (gesture.phase !== "pending" && gesture.phase !== "dragging") {
			// An established mascot gesture takes precedence over the ancestor's pending pan.
			event.preventDefault();
		}
		if (gesture.phase === "pinching") {
			const [first, second] = gesture.pointers.values();
			onPinchMove(distance(first, second) / gesture.pinchDistance);
		}
	};

	const finishPointer = (event: PointerEvent<HTMLButtonElement>) => {
		const gesture = gestureRef.current;
		if (!gesture?.pointers.delete(event.pointerId)) return;

		window.clearTimeout(gesture.holdTimer);
		const canceled = event.type !== "pointerup";
		if (canceled || distance(point(event), gesture.origin) >= dragThreshold) {
			suppressClick.current = true;
		}
		const tapped =
			event.pointerType === "touch" && gesture.phase === "pending" && !suppressClick.current;
		if (gesture.phase === "holding" || gesture.phase === "pinching") {
			gesture.phase = "consumed";
			onRelease(canceled);
		}
		if (gesture.pointers.size === 0) gestureRef.current = null;
		if (tapped) {
			// Chromium can omit the synthesized click after a quick pan.
			suppressClick.current = true;
			onBoop();
		}
	};

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp: finishPointer,
		onPointerCancel: finishPointer,
		onLostPointerCapture: finishPointer,
		onClick: (event: MouseEvent<HTMLButtonElement>) => {
			// Keyboard and assistive technology activate the native button with detail 0.
			if (gestureRef.current || (event.detail > 0 && suppressClick.current)) return;
			onBoop();
		},
	};
}
