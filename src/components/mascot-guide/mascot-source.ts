export const USAGE_SNIPPET = `import { Mascot } from "./mascot";

export function MascotDemo() {
  return (
    <Mascot
      directions="/mascots/edward-directions.webp"
      reactions="/mascots/edward-reactions.webp"
      mode="cycle"
      size={140}
    />
  );
}`;

export const MASCOT_SOURCE_CODE = `"use client";

import type { CSSProperties, PointerEvent, TouchEvent } from "react";
import { useEffect, useRef, useState } from "react";

export const DIRECTIONS = [
  "up-left",
  "up",
  "up-right",
  "left",
  "center",
  "right",
  "down-left",
  "down",
  "down-right",
] as const;

export const REACTIONS = [
  "blink", // 0
  "heart", // 1
  "sparkle", // 2
  "surprised", // 3
  "wink", // 4
  "bashful", // 5
  "sleepy", // 6
  "dizzy", // 7
  "delighted", // 8
] as const;

export type Direction = (typeof DIRECTIONS)[number];
export type Reaction = (typeof REACTIONS)[number];
export type BoopOrder = "cycle" | "random" | "escalate";

const CLOCKWISE: Direction[] = [
  "right",
  "down-right",
  "down",
  "down-left",
  "left",
  "up-left",
  "up",
  "up-right",
];
const SECTOR = (Math.PI * 2) / CLOCKWISE.length;
const HYSTERESIS = 0.12;
const DEAD_ZONE = 70;

const DEFAULT_PAYOFFS: Reaction[] = ["heart", "sparkle", "delighted"];
const BOOP_PAYOFF = 120;
const BOOP_END = 560;
const SQUASH_MS = 420;
const DIZZY_AFTER = 4;
const DIZZY_WINDOW = 1600;
const DIZZY_END = 1100;
const HOLD_THRESHOLD_MS = 220;
const PINCH_DIZZY_MS = 1400;

const SQUASH: Keyframe[] = [
  { transform: "scale(1, 1)", easing: "ease-in" },
  { transform: "scale(1.10, 0.86)", offset: 0.18, easing: "ease-out" },
  { transform: "scale(0.95, 1.08)", offset: 0.45, easing: "ease-in-out" },
  { transform: "scale(1.03, 0.97)", offset: 0.72, easing: "ease-in-out" },
  { transform: "scale(1, 1)" },
];

const PINCH_WOBBLE: Keyframe[] = [
  { transform: "scale(0.86, 1.15) rotate(-3deg)" },
  { transform: "scale(0.88, 1.12) rotate(3deg)", offset: 0.5 },
  { transform: "scale(0.86, 1.15) rotate(-3deg)" },
];

const PINCH_RELEASE: Keyframe[] = [
  { transform: "scale(0.86, 1.15)", easing: "ease-out" },
  { transform: "scale(1.24, 0.82)", offset: 0.22, easing: "ease-in-out" },
  { transform: "scale(0.92, 1.10)", offset: 0.48, easing: "ease-in-out" },
  { transform: "scale(1.06, 0.96)", offset: 0.74, easing: "ease-in-out" },
  { transform: "scale(1, 1)", easing: "ease-out" },
];

function cell(index: number): CSSProperties {
  return { backgroundPosition: \`\${(index % 3) * 50}% \${Math.floor(index / 3) * 50}%\` };
}

function wrap(angle: number) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

const layer: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundSize: "300% 300%",
  backgroundRepeat: "no-repeat",
};

export type MascotProps = {
  /** The 3x3 WebP sheet of head directions (9 cells). A served path or imported image. */
  directions: string;
  /** The 3x3 WebP sheet of expressions (9 cells). */
  reactions: string;
  /** Mascot width and height in pixels (default 140). */
  size?: number;
  className?: string;
  /** Screen reader accessible label (default "mascot"). */
  label?: string;
  /**
   * Poke reaction mode:
   * - 'cycle': Sequentially plays through all 9 expressions on each click
   * - 'random': Randomly picks one of the 9 expressions
   * - 'escalate': Original behavior (blink -> payoffs, rapid clicking -> dizzy)
   */
  mode?: BoopOrder;
  /** Custom reaction payoffs for escalate mode */
  payoffs?: Reaction[];
  /** Reaction to display when pinched/held (default "surprised") */
  pinchReaction?: Reaction;
  /** Reaction to display when released after pinch (default "delighted") */
  releaseReaction?: Reaction;
  /** Callback when a reaction triggers */
  onReact?: (reaction: Reaction) => void;
  /** Callback when user starts interacting (click, press, pinch) */
  onInteractStart?: () => void;
  /** Callback when user stops interacting (release, click end) */
  onInteractEnd?: () => void;
};

export function Mascot({
  directions,
  reactions,
  size = 140,
  className = "",
  label = "mascot",
  mode = "cycle",
  payoffs = DEFAULT_PAYOFFS,
  pinchReaction = "surprised",
  releaseReaction = "delighted",
  onReact,
  onInteractStart,
  onInteractEnd,
}: MascotProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const squashRef = useRef<HTMLSpanElement>(null);
  const timersRef = useRef<number[]>([]);
  const boopsRef = useRef({ count: 0, at: 0 });
  const cycleStepRef = useRef(0);

  const holdTimerRef = useRef<number | null>(null);
  const dizzyTimerRef = useRef<number | null>(null);
  const pinchAnimationRef = useRef<Animation | null>(null);
  const isPinchedRef = useRef(false);
  const wasPinchedRef = useRef(false);
  const touchPinchRef = useRef<{ initialDist: number } | null>(null);

  const [direction, setDirection] = useState<Direction>("center");
  const [reaction, setReaction] = useState<Reaction | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    let sector = -1;
    let pointer: { x: number; y: number } | null = null;

    const aim = () => {
      const button = buttonRef.current;
      if (!button || !pointer || isPinchedRef.current) return;

      const box = button.getBoundingClientRect();
      const dx = pointer.x - (box.left + box.width / 2);
      const dy = pointer.y - (box.top + box.height / 2);

      if (Math.hypot(dx, dy) < DEAD_ZONE) {
        sector = -1;
        setDirection("center");
        return;
      }

      const angle = Math.atan2(dy, dx);
      if (sector !== -1 && Math.abs(wrap(angle - sector * SECTOR)) < SECTOR / 2 + HYSTERESIS) {
        return;
      }

      sector = (Math.round(angle / SECTOR) + CLOCKWISE.length) % CLOCKWISE.length;
      setDirection(CLOCKWISE[sector]);
    };

    const onPointerMove = (event: globalThis.PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      aim();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", aim, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", aim);
    };
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(window.clearTimeout);
      timersRef.current = [];
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      if (dizzyTimerRef.current) window.clearTimeout(dizzyTimerRef.current);
      pinchAnimationRef.current?.cancel();
    };
  }, []);

  const startPinch = () => {
    isPinchedRef.current = true;
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];

    setReaction(pinchReaction);
    onReact?.(pinchReaction);

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      pinchAnimationRef.current =
        squashRef.current?.animate(PINCH_WOBBLE, {
          duration: 280,
          iterations: Infinity,
          easing: "ease-in-out",
        }) ?? null;
    }

    dizzyTimerRef.current = window.setTimeout(() => {
      if (isPinchedRef.current) {
        setReaction("dizzy");
        onReact?.("dizzy");
      }
    }, PINCH_DIZZY_MS);
  };

  const endPinch = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (dizzyTimerRef.current) {
      window.clearTimeout(dizzyTimerRef.current);
      dizzyTimerRef.current = null;
    }

    if (!isPinchedRef.current) return;

    isPinchedRef.current = false;
    wasPinchedRef.current = true;
    setTimeout(() => {
      wasPinchedRef.current = false;
    }, 100);

    pinchAnimationRef.current?.cancel();
    pinchAnimationRef.current = null;

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      squashRef.current?.animate(PINCH_RELEASE, { duration: 520, easing: "linear" });
    }

    setReaction(releaseReaction);
    onReact?.(releaseReaction);

    timersRef.current.push(
      window.setTimeout(() => {
        setReaction(null);
      }, 750),
    );
  };

  const handlePointerDown = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    onInteractStart?.();

    if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    holdTimerRef.current = window.setTimeout(() => {
      startPinch();
    }, HOLD_THRESHOLD_MS);
  };

  const handlePointerUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (isPinchedRef.current) endPinch();
    onInteractEnd?.();
  };

  const handleTouchStart = (e: TouchEvent<HTMLButtonElement>) => {
    onInteractStart?.();
    if (e.touches.length === 2) {
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      touchPinchRef.current = { initialDist: dist };
      startPinch();
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLButtonElement>) => {
    if (touchPinchRef.current && e.touches.length === 2 && squashRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const ratio = dist / touchPinchRef.current.initialDist;
      const sx = Math.max(0.7, Math.min(1.3, ratio));
      const sy = Math.max(0.7, Math.min(1.3, 1 / ratio));
      squashRef.current.style.transform = \`scale(\${sx}, \${sy})\`;
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLButtonElement>) => {
    if (touchPinchRef.current && e.touches.length < 2) {
      touchPinchRef.current = null;
      if (squashRef.current) squashRef.current.style.transform = "";
      endPinch();
    }
    onInteractEnd?.();
  };

  const boop = () => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];

    const later = (ms: number, next: Reaction | null) => {
      timersRef.current.push(
        window.setTimeout(() => {
          setReaction(next);
          if (next) onReact?.(next);
        }, ms),
      );
    };

    const now = Date.now();
    const boops = boopsRef.current;
    boops.count = now - boops.at < DIZZY_WINDOW ? boops.count + 1 : 1;
    boops.at = now;

    let chosen: Reaction;

    if (mode === "cycle") {
      chosen = REACTIONS[cycleStepRef.current % REACTIONS.length];
      cycleStepRef.current += 1;
      setReaction("blink");
      later(BOOP_PAYOFF, chosen);
      later(BOOP_END, null);
    } else if (mode === "random") {
      const randomIndex = Math.floor(Math.random() * REACTIONS.length);
      chosen = REACTIONS[randomIndex];
      setReaction("blink");
      later(BOOP_PAYOFF, chosen);
      later(BOOP_END, null);
    } else {
      if (boops.count >= DIZZY_AFTER) {
        boops.count = 0;
        setReaction("dizzy");
        onReact?.("dizzy");
        later(DIZZY_END, null);
      } else {
        chosen = payoffs[(boops.count - 1) % payoffs.length];
        setReaction("blink");
        later(BOOP_PAYOFF, chosen);
        later(BOOP_END, null);
      }
    }

    if (
      typeof window !== "undefined" &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      squashRef.current?.animate(SQUASH, { duration: SQUASH_MS, easing: "linear" });
    }
  };

  const handleClick = () => {
    if (wasPinchedRef.current || isPinchedRef.current) return;
    onInteractStart?.();
    boop();
    onInteractEnd?.();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      aria-label={\`Boop the \${label}\`}
      className={\`touch-none outline-none select-none \${className}\`}
      style={{
        position: "relative",
        display: "block",
        flexShrink: 0,
        width: size,
        height: size,
        padding: 0,
        border: 0,
        background: "transparent",
        appearance: "none",
        cursor: "pointer",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
        touchAction: "none",
      }}
    >
      <span
        ref={squashRef}
        style={{
          position: "relative",
          display: "block",
          width: "100%",
          height: "100%",
          transformOrigin: "50% 78%",
        }}
      >
        <span
          style={{
            ...layer,
            backgroundImage: \`url(\${directions})\`,
            ...cell(DIRECTIONS.indexOf(direction)),
            opacity: reaction ? 0 : 1,
          }}
        />
        <span
          style={{
            ...layer,
            backgroundImage: \`url(\${reactions})\`,
            ...cell(REACTIONS.indexOf(reaction ?? "blink")),
            opacity: reaction ? 1 : 0,
          }}
        />
      </span>
    </button>
  );
}`;
