// Utility to handle Gemini raw PCM audio decoding

let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

export const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000, // Gemini TTS standard sample rate
    });
  }
  return audioContext;
};

function atob_safe(base64: string) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  base64String: string,
  ctx: AudioContext
): Promise<AudioBuffer> {
  const bytes = atob_safe(base64String);
  // Gemini sends raw PCM (Int16), not a WAV file.
  // We need to convert Int16 -> Float32 manually for AudioBuffer
  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1; // Usually mono
  const sampleRate = 24000;
  
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalize Int16 to Float32 [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function stopAudio() {
    if (currentSource) {
        try {
            currentSource.stop();
        } catch (e) {
            // Ignore errors if already stopped
        }
        currentSource = null;
    }
}

export async function playAudioBuffer(buffer: AudioBuffer): Promise<void> {
  const ctx = getAudioContext();
  // Resume context if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  // Stop any currently playing audio before starting new one
  stopAudio();

  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    currentSource = source;

    source.onended = () => {
        if (currentSource === source) {
            currentSource = null;
        }
        resolve();
    };
    source.start();
  });
}