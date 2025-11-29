
export const playSynthSound = (id: string) => {
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const createOscillator = (type: OscillatorType, freq: number, duration: number, vol: number = 0.5, delay: number = 0) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + duration);
        osc.stop(ctx.currentTime + delay + duration);
    };

    const createNoise = (duration: number, vol: number = 0.5) => {
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const gain = ctx.createGain();
        noise.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    };

    switch (id) {
        case 'ui_click_subtle':
            createOscillator('sine', 800, 0.05, 0.1);
            break;
        case 'ui_hover':
            createOscillator('triangle', 400, 0.02, 0.05);
            break;
        case 'ui_error':
            createOscillator('sawtooth', 150, 0.2, 0.2);
            break;
        case 'sfx_build_start':
            createOscillator('square', 150, 0.1, 0.2);
            createOscillator('square', 200, 0.1, 0.2, 0.1);
            break;
        case 'sfx_build_complete':
            createOscillator('sine', 400, 0.2, 0.2);
            createOscillator('sine', 600, 0.4, 0.2, 0.1);
            break;
        case 'sfx_attack_sword':
            createNoise(0.1, 0.3);
            createOscillator('sawtooth', 100, 0.1, 0.2);
            break;
        case 'sfx_unit_die':
            createOscillator('sawtooth', 150, 0.3, 0.2);
            createOscillator('sawtooth', 100, 0.3, 0.2, 0.1);
            break;
        case 'amb_forest':
            // Simple placeholder - looping ambiance is handled differently usually, 
            // but for one-off triggers or short loops:
            createOscillator('sine', 200, 0.5, 0.01);
            break;
        case 'amb_wasteland':
            createNoise(0.5, 0.05);
            break;
        default:
            break;
    }
};
