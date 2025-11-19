
// Simple, synthesizer-based sound effects to ensure they are lightweight,
// reliable, and "cute" (soft attacks, round waveforms).

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Helper to create a soft gain envelope (fades out gently)
const playTone = (
  freq: number, 
  type: OscillatorType, 
  duration: number, 
  volume: number = 0.1,
  slide: number = 0 // Hz to slide down/up
) => {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slide !== 0) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(10, freq + slide), ctx.currentTime + duration);
  }

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + duration);
};

// Noise buffer for paper/shaker sounds
let noiseBuffer: AudioBuffer | null = null;
const getNoiseBuffer = (ctx: AudioContext) => {
  if (!noiseBuffer) {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseBuffer = buffer;
  }
  return noiseBuffer;
};

export const playSfx = (type: 'click' | 'pop' | 'pickup' | 'drop' | 'success' | 'typing' | 'switch') => {
  try {
    const ctx = initAudio();

    switch (type) {
      case 'click':
        // High, short blip
        playTone(800, 'sine', 0.1, 0.05, -200);
        break;
        
      case 'pop':
        // bubbly sound
        playTone(400, 'sine', 0.15, 0.1, -100);
        break;

      case 'switch':
        // Mechanical click
        playTone(300, 'triangle', 0.05, 0.05);
        setTimeout(() => playTone(400, 'triangle', 0.05, 0.05), 50);
        break;

      case 'pickup':
        // Paper rustle (filtered noise)
        {
          const src = ctx.createBufferSource();
          src.buffer = getNoiseBuffer(ctx);
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          
          filter.type = 'lowpass';
          filter.frequency.value = 800;
          
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
          
          src.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          src.start();
          src.stop(ctx.currentTime + 0.1);
        }
        break;

      case 'drop':
        // Soft wood thud
        playTone(150, 'triangle', 0.1, 0.15, -50);
        break;

      case 'typing':
        // Very quiet, high tick
        {
           // Randomize slightly for realism
           const pitch = 700 + Math.random() * 200;
           playTone(pitch, 'sine', 0.03, 0.02);
        }
        break;

      case 'success':
        // Little major chord arpeggio
        const now = ctx.currentTime;
        const notes = [523.25, 659.25, 783.99]; // C Major (C5, E5, G5)
        notes.forEach((freq, i) => {
           setTimeout(() => playTone(freq, 'sine', 0.3, 0.05), i * 60);
        });
        break;
    }
  } catch (e) {
    console.warn("Audio context failed", e);
  }
};
