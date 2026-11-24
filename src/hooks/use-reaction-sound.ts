import { reactionSounds } from "@/lib/audio/reaction-sounds";
import { buildSound } from "@/lib/audio/zzfx";
import type { Reaction } from "@/lib/mascot-sprites";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

export const SOUND_STORAGE_KEY = "aniboop-reaction-sounds";

const MAX_VOICES = 3;

const soundStoreListeners = new Set<() => void>();

function getSoundSnapshot(): boolean {
	try {
		return localStorage.getItem(SOUND_STORAGE_KEY) === "true";
	} catch {
		return false;
	}
}

function getServerSoundSnapshot(): boolean {
	return false;
}

function subscribeSound(onStoreChange: () => void) {
	soundStoreListeners.add(onStoreChange);

	const handleStorage = (event: StorageEvent) => {
		if (event.key === SOUND_STORAGE_KEY) {
			onStoreChange();
		}
	};

	window.addEventListener("storage", handleStorage);

	return () => {
		soundStoreListeners.delete(onStoreChange);
		window.removeEventListener("storage", handleStorage);
	};
}

function notifySoundChange() {
	for (const listener of soundStoreListeners) {
		listener();
	}
}

export function useReactionSound() {
	const soundEnabled = useSyncExternalStore(
		subscribeSound,
		getSoundSnapshot,
		getServerSoundSnapshot,
	);
	const enabled = useRef(soundEnabled);
	const context = useRef<AudioContext | null>(null);
	const buffers = useRef(new Map<Reaction, AudioBuffer>());
	const voices = useRef(new Set<AudioBufferSourceNode>());

	useEffect(() => {
		enabled.current = soundEnabled;
		if (!soundEnabled) {
			for (const voice of voices.current) voice.stop();
			voices.current.clear();
		}
	}, [soundEnabled]);

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
		if (!enabled.current) return;
		if (!context.current) {
			try {
				context.current = new AudioContext();
			} catch {
				return;
			}
		}
		const audio = context.current;
		if (audio && audio.state !== "running") {
			void audio.resume().catch(() => {});
		}
	}, []);

	const toggleSound = () => {
		const next = !enabled.current;
		if (!next) {
			for (const voice of voices.current) voice.stop();
			voices.current.clear();
		} else {
			try {
				context.current ??= new AudioContext();
			} catch {
				return;
			}
			resumeSound();
		}

		try {
			localStorage.setItem(SOUND_STORAGE_KEY, String(next));
		} catch {
			// Ignore localStorage write errors.
		}

		notifySoundChange();
	};

	const playReactionSound = useCallback((reaction: Reaction) => {
		if (!enabled.current) return;
		if (!context.current) {
			try {
				context.current = new AudioContext();
			} catch {
				return;
			}
		}
		const audio = context.current;
		if (audio.state !== "running") return;

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
