import { buildSound } from "@/lib/audio/zzfx";
import type { Reaction } from "@/lib/mascot-sprites";

type SoundPreset =
	Parameters<typeof buildSound> extends [AudioContext, ...infer Preset] ? Preset : never;

// ZzFX parameter order. Pitch randomness is zero so every expression has a recognizable cue.
export const reactionSounds = {
	blink: [0.28, 0, 680, 0.003, 0.009, 0.046, 0, 1.6, -7], // Soft eyelid tick
	heart: [0.4, 0, 405, 0.012, 0.06, 0.15, 0, 1, 0.7, 0, 135, 0.078], // Warm double pulse
	sparkle: [0.36, 0, 980, 0.005, 0.04, 0.15, 0, 1.6, 1.8, 0, 390, 0.037, 0.085, 0, 0, 0, 0.06], // High glint with an echo
	surprised: [0.46, 0, 285, 0.005, 0.041, 0.12, 1, 1.5, 4, -6, 270, 0.041], // Quick upward squeak
	wink: [0.32, 0, 880, 0.004, 0.025, 0.075, 1, 2, -5, 0, 220, 0.023], // Cheeky two-tone chirp
	bashful: [0.34, 0, 590, 0.023, 0.053, 0.15, 0, 1.3, -2.4, 0, -110, 0.066], // Soft falling note
	sleepy: [0.32, 0, 235, 0.045, 0.072, 0.23, 0, 1.5, -0.55, 0, 0, 0, 0.16, 0, 0, 0, 0, 1, 0, 0.3], // Slow, low sigh
	dizzy: [
		0.39, 0, 330, 0.01, 0.24, 0.18, 0, 1.3, 2.4, 0, -90, 0.047, 0.093, 0, 0, 0, 0, 1, 0, 0.28,
	], // Cycling wobble
	delighted: [0.43, 0, 510, 0.007, 0.08, 0.17, 1, 1.4, 2.8, 0, 190, 0.06], // Bright rising chime
} satisfies Record<Reaction, SoundPreset>;
