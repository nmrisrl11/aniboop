"use client";

// Adapted from Thiings Grid by Charlie Clark (MIT). See THIINGS-GRID-LICENSE.txt.
import { Component, createRef, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";

export const DRAG_THRESHOLD = 5;
const FRICTION_PER_MS = 0.997;
const MIN_VELOCITY = 0.05 / 16;
const MAX_VELOCITY = 3;
const RELEASE_DELAY = 100;

const arrowOffsets = {
	ArrowLeft: { x: 1, y: 0 },
	ArrowRight: { x: -1, y: 0 },
	ArrowUp: { x: 0, y: 1 },
	ArrowDown: { x: 0, y: -1 },
};

type Position = { x: number; y: number };

type Gesture = {
	pointerId: number;
	origin: Position;
	startOffset: Position;
	lastPoint: Position;
	lastTime: number;
	active: boolean;
};

type GridItem = { position: Position; gridIndex: number };
type State = { gridItems: GridItem[]; isMoving: boolean; isDragging: boolean };
export type ItemConfig = GridItem & { isMoving: boolean };

type ThiingsGridProps = {
	gridSize: number;
	renderItem: (item: ItemConfig) => ReactNode;
	className?: string;
	label: string;
	describedBy?: string;
	initialPosition?: Position;
};

class ThiingsGrid extends Component<ThiingsGridProps, State> {
	state: State = { gridItems: [], isMoving: false, isDragging: false };
	private viewport = createRef<HTMLDivElement>();
	private plane = createRef<HTMLDivElement>();
	private resizeObserver: ResizeObserver | null = null;
	private gesture: Gesture | null = null;
	private offset = this.props.initialPosition ?? { x: 0, y: 0 };
	private velocity: Position = { x: 0, y: 0 };
	private viewportSize = { width: 0, height: 0 };
	private gridCenter: Position | null = null;
	private frame: number | null = null;
	private coastTime: number | null = null;
	private idleTimer: ReturnType<typeof setTimeout> | undefined;

	componentDidMount() {
		const viewport = this.viewport.current;
		if (!viewport) return;
		viewport.addEventListener("wheel", this.handleWheel, { passive: false });
		this.resizeObserver = new ResizeObserver(this.measure);
		this.resizeObserver.observe(viewport);
		this.measure();
	}

	componentWillUnmount() {
		this.viewport.current?.removeEventListener("wheel", this.handleWheel);
		this.resizeObserver?.disconnect();
		if (this.frame !== null) cancelAnimationFrame(this.frame);
		clearTimeout(this.idleTimer);
		this.frame = null;
		this.coastTime = null;
		this.gesture = null;
	}

	private measure = () => {
		const viewport = this.viewport.current;
		if (!viewport) return;
		const { width, height } = viewport.getBoundingClientRect();
		if (width === this.viewportSize.width && height === this.viewportSize.height && this.gridCenter)
			return;
		this.viewportSize = { width, height };
		this.gridCenter = null;
		this.schedulePaint();
	};

	private updateGridItems = () => {
		const { width, height } = this.viewportSize;
		if (width === 0 || height === 0) return;
		const { gridSize } = this.props;
		const x = -Math.round(this.offset.x / gridSize);
		const y = -Math.round(this.offset.y / gridSize);
		if (x === this.gridCenter?.x && y === this.gridCenter.y) return;
		this.gridCenter = { x, y };

		// Keep one extra cell beyond the visible window while React commits the next one.
		const columns = Math.ceil(width / (2 * gridSize)) + 1;
		const rows = Math.ceil(height / (2 * gridSize)) + 1;
		const gridItems: GridItem[] = [];
		for (let row = y - rows; row <= y + rows; row++) {
			for (let column = x - columns; column <= x + columns; column++) {
				gridItems.push({
					position: { x: column, y: row },
					gridIndex: this.getItemIndexForPosition(column, row),
				});
			}
		}
		this.setState({ gridItems });
	};

	private getItemIndexForPosition = (x: number, y: number): number => {
		// Special case for center
		if (x === 0 && y === 0) return 0;

		// Determine which layer of the spiral we're in
		const layer = Math.max(Math.abs(x), Math.abs(y));

		// Calculate the size of all inner layers
		const innerLayersSize = Math.pow(2 * layer - 1, 2);

		// Calculate position within current layer
		let positionInLayer = 0;

		if (y === 0 && x === layer) {
			// Starting position (middle right)
			positionInLayer = 0;
		} else if (y < 0 && x === layer) {
			// Right side, bottom half
			positionInLayer = -y;
		} else if (y === -layer && x > -layer) {
			// Bottom side
			positionInLayer = layer + (layer - x);
		} else if (x === -layer && y < layer) {
			// Left side
			positionInLayer = 3 * layer + (layer + y);
		} else if (y === layer && x < layer) {
			// Top side
			positionInLayer = 5 * layer + (layer + x);
		} else {
			// Right side, top half (y > 0 && x === layer)
			positionInLayer = 7 * layer + (layer - y);
		}

		const index = innerLayersSize + positionInLayer;
		return index;
	};

	private schedulePaint = () => {
		if (this.frame === null) this.frame = requestAnimationFrame(this.paint);
	};

	private paint = (time: number) => {
		this.frame = null;
		if (this.coastTime !== null) {
			const elapsed = Math.min(Math.max(0, time - this.coastTime), 48);
			const decay = FRICTION_PER_MS ** elapsed;
			const distance = (decay - 1) / Math.log(FRICTION_PER_MS);
			this.offset = {
				x: this.offset.x + this.velocity.x * distance,
				y: this.offset.y + this.velocity.y * distance,
			};
			this.velocity = { x: this.velocity.x * decay, y: this.velocity.y * decay };
			this.coastTime = time;
			if (Math.hypot(this.velocity.x, this.velocity.y) <= MIN_VELOCITY) {
				this.coastTime = null;
				this.setState({ isMoving: false });
			}
		}

		// Only the viewport window needs a React update. Panning moves one CSS layer.
		const plane = this.plane.current;
		if (plane) plane.style.transform = `translate3d(${this.offset.x}px, ${this.offset.y}px, 0)`;
		this.updateGridItems();
		if (this.coastTime !== null) this.schedulePaint();
	};

	private handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
		if (!event.isPrimary || event.button !== 0 || this.gesture) return;
		clearTimeout(this.idleTimer);
		this.coastTime = null;
		this.velocity = { x: 0, y: 0 };
		this.setState((state) => (state.isMoving ? { isMoving: false } : null));
		const point = { x: event.clientX, y: event.clientY };
		this.gesture = {
			pointerId: event.pointerId,
			origin: point,
			startOffset: this.offset,
			lastPoint: point,
			lastTime: event.timeStamp,
			active: false,
		};
	};

	private handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
		const gesture = this.gesture;
		if (gesture?.pointerId !== event.pointerId) return;
		if (!gesture.active && event.defaultPrevented) {
			this.gesture = null;
			return;
		}

		const dx = event.clientX - gesture.origin.x;
		const dy = event.clientY - gesture.origin.y;
		if (!gesture.active) {
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
			gesture.active = true;
			event.currentTarget.setPointerCapture(event.pointerId);
			this.setState({ isDragging: true, isMoving: true });
		}

		const elapsed = Math.max(4, event.timeStamp - gesture.lastTime);
		this.velocity = {
			x: this.velocity.x * 0.3 + ((event.clientX - gesture.lastPoint.x) / elapsed) * 0.7,
			y: this.velocity.y * 0.3 + ((event.clientY - gesture.lastPoint.y) / elapsed) * 0.7,
		};
		gesture.lastPoint = { x: event.clientX, y: event.clientY };
		gesture.lastTime = event.timeStamp;
		this.offset = { x: gesture.startOffset.x + dx, y: gesture.startOffset.y + dy };
		this.schedulePaint();
	};

	private finishPointer = (event: PointerEvent<HTMLDivElement>) => {
		// Touch initially captures on the tile. Ignore its event when capture moves to the viewport.
		if (event.type === "lostpointercapture" && event.target !== event.currentTarget) return;
		const gesture = this.gesture;
		if (gesture?.pointerId !== event.pointerId) return;
		if (event.type === "pointerleave" && gesture.active) return;
		this.gesture = null;
		if (!gesture.active) return;

		const speed = Math.hypot(this.velocity.x, this.velocity.y);
		const canCoast =
			event.type === "pointerup" &&
			event.timeStamp - gesture.lastTime <= RELEASE_DELAY &&
			speed > MIN_VELOCITY &&
			!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.setState({ isDragging: false, isMoving: canCoast });
		if (canCoast) {
			const scale = Math.min(1, MAX_VELOCITY / speed);
			this.velocity = { x: this.velocity.x * scale, y: this.velocity.y * scale };
			this.coastTime = performance.now();
		}
		this.schedulePaint();
	};

	private panBy = (x: number, y: number) => {
		this.coastTime = null;
		this.offset = { x: this.offset.x + x, y: this.offset.y + y };
		this.setState((state) => (state.isMoving ? null : { isMoving: true }));
		clearTimeout(this.idleTimer);
		this.idleTimer = setTimeout(() => this.setState({ isMoving: false }), RELEASE_DELAY);
		this.schedulePaint();
	};

	private handleWheel = (event: WheelEvent) => {
		if (event.ctrlKey || this.gesture) return;
		event.preventDefault();
		const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.viewportSize.height : 1;
		this.panBy(-event.deltaX * scale, -event.deltaY * scale);
	};

	private handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		if (
			event.defaultPrevented ||
			event.altKey ||
			event.ctrlKey ||
			event.metaKey ||
			this.gesture ||
			!Object.hasOwn(arrowOffsets, event.key)
		)
			return;

		const direction = arrowOffsets[event.key as keyof typeof arrowOffsets];
		event.preventDefault();
		event.currentTarget.focus({ preventScroll: true });
		this.panBy(direction.x * this.props.gridSize, direction.y * this.props.gridSize);
	};

	render() {
		const { isDragging, gridItems, isMoving } = this.state;
		const { gridSize, renderItem, className, label, describedBy } = this.props;
		return (
			<div
				ref={this.viewport}
				role="region"
				aria-label={label}
				aria-describedby={describedBy}
				tabIndex={0}
				className={className}
				style={{
					position: "absolute",
					inset: 0,
					touchAction: "pinch-zoom",
					overflow: "clip",
					cursor: isDragging ? "grabbing" : "grab",
				}}
				onPointerDown={this.handlePointerDown}
				onPointerMove={this.handlePointerMove}
				onPointerUp={this.finishPointer}
				onPointerCancel={this.finishPointer}
				onPointerLeave={this.finishPointer}
				onLostPointerCapture={this.finishPointer}
				onKeyDown={this.handleKeyDown}
			>
				<div ref={this.plane} style={{ position: "absolute", inset: 0, willChange: "transform" }}>
					{gridItems.map((item) => (
						<div
							key={item.gridIndex}
							style={{
								position: "absolute",
								left: `calc(50% + ${(item.position.x - 0.5) * gridSize}px)`,
								top: `calc(50% + ${(item.position.y - 0.5) * gridSize}px)`,
								width: gridSize,
								height: gridSize,
								userSelect: "none",
							}}
						>
							{renderItem({ ...item, isMoving })}
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default ThiingsGrid;
