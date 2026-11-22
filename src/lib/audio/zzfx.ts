// ZzFXMicro 1.4.0 by Frank Force, MIT. See THIRD_PARTY_NOTICES.txt.
// https://github.com/KilledByAPixel/ZzFX/blob/master/ZzFXMicro.js
// The caller owns the AudioContext and playback. This port only builds the buffer.

const SAMPLE_RATE = 44100;
const TAU = Math.PI * 2;
const MASTER_VOLUME = 0.3;

function wave(phase: number, shape: number, curve: number) {
	switch (shape) {
		case 1:
			return 1 - 4 * Math.abs(Math.round(phase / TAU) - phase / TAU);
		case 2:
			return 1 - (((((2 * phase) / TAU) % 2) + 2) % 2);
		case 3:
			return Math.max(-1, Math.min(1, Math.tan(phase)));
		case 4:
			return Math.sin(phase ** 3);
		case 5:
			return (phase / TAU) % 1 < curve / 2 ? 1 : -1;
		default:
			return Math.sin(phase);
	}
}

export function buildSound(
	context: AudioContext,
	volume = 1,
	randomness = 0.05,
	frequency = 220,
	attack = 0,
	sustain = 0,
	release = 0.1,
	shape = 0,
	shapeCurve = 1,
	slide = 0,
	deltaSlide = 0,
	pitchJump = 0,
	pitchJumpTime = 0,
	repeatTime = 0,
	noise = 0,
	modulation = 0,
	bitCrush = 0,
	delay = 0,
	sustainVolume = 1,
	decay = 0,
	tremolo = 0,
	filter = 0,
) {
	attack = attack * SAMPLE_RATE || 9;
	decay *= SAMPLE_RATE;
	sustain *= SAMPLE_RATE;
	release *= SAMPLE_RATE;
	delay *= SAMPLE_RATE;
	const gain = volume * MASTER_VOLUME;
	const decayEnd = attack + decay;
	const sustainEnd = decayEnd + sustain;
	const length = Math.floor(sustainEnd + release + delay);
	const releaseEnd = length - delay;
	const buffer = context.createBuffer(1, length, SAMPLE_RATE);
	const samples = buffer.getChannelData(0);

	const startSlide = (slide * 500 * TAU) / SAMPLE_RATE ** 2;
	const acceleration = (deltaSlide * 500 * TAU) / SAMPLE_RATE ** 3;
	let startFrequency = (frequency * (1 + randomness * (2 * Math.random() - 1)) * TAU) / SAMPLE_RATE;
	let angularFrequency = startFrequency;
	let angularSlide = startSlide;
	let jump = 1;
	const jumpAmount = (pitchJump * TAU) / SAMPLE_RATE;
	const jumpAt = pitchJumpTime * SAMPLE_RATE;
	const repeatSamples = Math.floor(repeatTime * SAMPLE_RATE);
	const crushSamples = Math.floor(bitCrush * 100);
	const modulationStep = (modulation * TAU) / SAMPLE_RATE;
	let phase = 0;
	let sample = 0;

	// ZzFX's biquad filter uses positive values for high-pass and negative for low-pass.
	const angle = (TAU * Math.abs(filter) * 2) / SAMPLE_RATE;
	const cosine = Math.cos(angle);
	const alpha = Math.sin(angle) / 4;
	const filterSign = filter < 0 ? -1 : 1;
	const a0 = 1 + alpha;
	const a1 = (-2 * cosine) / a0;
	const a2 = (1 - alpha) / a0;
	const b0 = (1 + filterSign * cosine) / (2 * a0);
	const b1 = -(filterSign + cosine) / a0;
	let previousInput = 0;
	let olderInput = 0;
	let previousOutput = 0;
	let olderOutput = 0;

	for (let i = 0; i < length; i++) {
		if (!crushSamples || (i + 1) % crushSamples === 0) {
			const raw = wave(phase, shape, shapeCurve);
			sample = shape > 4 ? raw : Math.sign(raw) * Math.abs(raw) ** shapeCurve;
			if (repeatSamples && tremolo) {
				sample *= 1 - tremolo + tremolo * Math.sin((TAU * i) / repeatSamples);
			}

			if (i < attack) sample *= i / attack;
			else if (i < decayEnd) sample *= 1 - ((i - attack) / decay) * (1 - sustainVolume);
			else if (i < sustainEnd) sample *= sustainVolume;
			else if (i < releaseEnd) sample *= ((releaseEnd - i) / release) * sustainVolume;
			else sample = 0;

			if (delay) {
				const echo = i >= delay && gain ? samples[Math.floor(i - delay)] / gain : 0;
				const tail = i < releaseEnd ? 1 : (length - i) / delay;
				sample = (sample + tail * echo) / 2;
			}
			if (filter) {
				const output =
					b0 * (olderInput + sample) + b1 * previousInput - a2 * olderOutput - a1 * previousOutput;
				olderInput = previousInput;
				previousInput = sample;
				olderOutput = previousOutput;
				previousOutput = output;
				sample = output;
			}
		}

		samples[i] = sample * gain;
		angularSlide += acceleration;
		angularFrequency += angularSlide;
		const step = angularFrequency * Math.cos(modulationStep * i);
		phase += step + step * noise * (((i * i * TAU) % 2) - 1);
		if (jump && ++jump > jumpAt) {
			angularFrequency += jumpAmount;
			startFrequency += jumpAmount;
			jump = 0;
		}
		if (repeatSamples && (i + 1) % repeatSamples === 0) {
			angularFrequency = startFrequency;
			angularSlide = startSlide;
			jump ||= 1;
		}
	}

	return buffer;
}
