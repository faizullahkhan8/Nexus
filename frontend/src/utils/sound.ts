type CallType = "audio" | "video";

let audioContext: AudioContext | null = null;
let callToneInterval: number | null = null;
let primed = false;

const getAudioContext = () => {
    if (typeof window === "undefined") return null;

    const win = window as Window & {
        webkitAudioContext?: typeof AudioContext;
    };

    if (!audioContext) {
        const ContextCtor =
            typeof AudioContext !== "undefined"
                ? AudioContext
                : win.webkitAudioContext;
        if (!ContextCtor) return null;
        audioContext = new ContextCtor();
    }

    const context = audioContext;
    if (!context) return null;

    if (context.state === "suspended") {
        void context.resume().catch(() => undefined);
    }

    return context;
};

const playTone = (
    frequency: number,
    durationMs: number,
    delayMs: number,
    waveType: OscillatorType,
    volume: number,
) => {
    const context = getAudioContext();
    if (!context) return;

    const startAt = context.currentTime + delayMs / 1000;
    const durationSeconds = durationMs / 1000;

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = waveType;
    oscillator.frequency.setValueAtTime(frequency, startAt);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startAt + durationSeconds,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startAt);
    oscillator.stop(startAt + durationSeconds + 0.03);
};

const playPattern = (
    frequencies: number[],
    durationMs: number,
    gapMs: number,
    waveType: OscillatorType,
    volume: number,
) => {
    frequencies.forEach((frequency, index) => {
        const delayMs = index * (durationMs + gapMs);
        playTone(frequency, durationMs, delayMs, waveType, volume);
    });
};

const playCallPulse = (type: CallType) => {
    if (type === "video") {
        playPattern([700, 880], 180, 130, "square", 0.04);
        return;
    }

    playPattern([440, 520], 200, 150, "square", 0.04);
};

export const primeSound = () => {
    if (typeof window === "undefined" || primed) return;

    primed = true;

    const unlock = () => {
        const context = getAudioContext();
        if (context && context.state === "suspended") {
            void context.resume().catch(() => undefined);
        }
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
};

export const playMessageSound = () => {
    playPattern([760, 980], 90, 50, "triangle", 0.05);
};

export const playNotificationSound = () => {
    playPattern([920, 1240, 980], 70, 35, "sine", 0.045);
};

export const startCallTone = (type: CallType) => {
    stopCallTone();
    playCallPulse(type);

    if (typeof window === "undefined") return;

    callToneInterval = window.setInterval(() => {
        playCallPulse(type);
    }, 1800);
};

export const stopCallTone = () => {
    if (typeof window === "undefined") return;
    if (callToneInterval === null) return;

    window.clearInterval(callToneInterval);
    callToneInterval = null;
};

export const playCallConnectedSound = (type: CallType) => {
    if (type === "video") {
        playPattern([660, 990], 90, 40, "triangle", 0.05);
        return;
    }

    playPattern([520, 780], 100, 40, "triangle", 0.05);
};

export const playCallEndedSound = () => {
    playPattern([780, 620, 460], 80, 30, "sawtooth", 0.04);
};
