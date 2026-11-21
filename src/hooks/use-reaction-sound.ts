import { reactionSounds } from "@/lib/audio/reaction-sounds";
import { buildSound } from "@/lib/audio/zzfx";
import type { Reaction } from "@/lib/mascot-sprites";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_VOICES = 3;

export function useReactionSound() {
	const [soundEnabled, setSoundEnabled] = useState(false);
	const enabled = useRef(false);
	const context = useRef<AudioContext | null>(null);
	const buffers = useRef(new Map<Reaction, AudioBuffer>());
	const voices = useRef(new Set<AudioBufferSourceNode>());

	useEffect(() => {
		const cachedBuffers = buffers.current;
		const activeVoices = voices.current;
		return () => {
			for (const voice of activeVoices) voice.stop();
			activeVoices.clear();
			cachedBuffers.clear();
			void context.current?.close().catch(() => {});
			context.current = null;
		};
	}, []);

	const resumeSound = useCallback(() => {
		const audio = context.current;
		if (enabled.current && audio && audio.state !== "running") {
			void audio.resume().catch(() => {});
		}
	}, []);

	const toggleSound = () => {
		if (enabled.current) {
			enabled.current = false;
			for (const voice of voices.current) voice.stop();
			voices.current.clear();
		} else {
			try {
				context.current ??= new AudioContext();
			} catch {
				return;
			}
			enabled.current = true;
			// Resume inside the toggle's user activation, before any delayed gesture frames.
			resumeSound();
		}
		setSoundEnabled(enabled.current);
	};

	const playReactionSound = useCallback((reaction: Reaction) => {
		const audio = context.current;
		if (!enabled.current || audio?.state !== "running") return;

		let buffer = buffers.current.get(reaction);
		if (!buffer) {
			buffer = buildSound(audio, ...reactionSounds[reaction]);
			buffers.current.set(reaction, buffer);
		}

		const activeVoices = voices.current;
		if (activeVoices.size >= MAX_VOICES) {
			const [oldest] = activeVoices;
			oldest.stop();
			activeVoices.delete(oldest);
		}

		const voice = audio.createBufferSource();
		voice.buffer = buffer;
		voice.connect(audio.destination);
		voice.onended = () => {
			voice.disconnect();
			activeVoices.delete(voice);
		};
		voice.start();
		activeVoices.add(voice);
	}, []);

	return { soundEnabled, toggleSound, resumeSound, playReactionSound };
}
