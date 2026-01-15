
// Utility to handle Text-to-Speech using native Web Speech API (Fallback)
// AND WAV playback for cached Gemini audio (Primary High-Quality Offline).

let synth: SpeechSynthesis | null = null;
if (typeof window !== "undefined") {
  synth = window.speechSynthesis;
}

// Global state
let currentAudio: HTMLAudioElement | null = null;
let queue: string[] = [];
let onCompleteGlobal: (() => void) | null = null;
let isInternalPlaying = false;

// --- Helper: Create WAV Header ---
// Gemini 2.5 TTS returns: PCM, 24kHz, 1 Channel, 16-bit Little Endian
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

export const pcmToWav = (pcmData: Uint8Array): ArrayBuffer => {
    const headerSize = 44;
    const totalSize = headerSize + pcmData.length;
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    
    // RIFF chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + pcmData.length, true); // ChunkSize
    writeString(view, 8, 'WAVE');
    
    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
    view.setUint16(22, 1, true); // NumChannels (1)
    view.setUint32(24, 24000, true); // SampleRate (24000 Hz)
    view.setUint32(28, 24000 * 2, true); // ByteRate (SampleRate * BlockAlign)
    view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
    view.setUint16(34, 16, true); // BitsPerSample (16 bits)
    
    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, pcmData.length, true);
    
    // Copy PCM data
    const wavBytes = new Uint8Array(buffer);
    wavBytes.set(pcmData, headerSize);
    
    return buffer;
};

// --- Web Speech API Helper (Fallback) ---
const getEnglishVoice = (): SpeechSynthesisVoice | null => {
  if (!synth) return null;
  const voices = synth.getVoices();
  return (
    voices.find((v) => v.name === "Google US English") ||
    voices.find((v) => v.name.includes("Samantha")) || 
    voices.find((v) => v.name.includes("Daniel")) ||   
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null
  );
};

const chunkText = (text: string): string[] => {
  const rawSentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  return rawSentences.map(s => s.trim()).filter(s => s.length > 0);
};

const speakNext = () => {
    if (!synth || queue.length === 0) {
        isInternalPlaying = false;
        if (onCompleteGlobal) onCompleteGlobal();
        return;
    }

    const text = queue.shift()!;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getEnglishVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.9; 
    utterance.pitch = 1.0;
    utterance.onend = () => speakNext();
    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        speakNext();
    };
    synth.speak(utterance);
};

export const playText = (text: string, onComplete?: () => void) => {
    stopAudio();
    if (!synth) {
        if (onComplete) onComplete();
        return;
    }

    queue = chunkText(text);
    onCompleteGlobal = onComplete || null;
    isInternalPlaying = true;

    if (synth.getVoices().length === 0) {
        const tempHandler = () => {
            synth!.onvoiceschanged = null;
            if (isInternalPlaying) speakNext();
        };
        synth.onvoiceschanged = tempHandler;
        setTimeout(() => {
            if (isInternalPlaying && synth!.speaking === false) speakNext();
        }, 100);
    } else {
        speakNext();
    }
};

// --- WAV Playback Helper (Primary High Quality) ---

export const playWav = (wavData: ArrayBuffer, onComplete?: () => void) => {
    stopAudio();

    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    const audio = new Audio(url);
    currentAudio = audio;
    isInternalPlaying = true;

    audio.onended = () => {
        isInternalPlaying = false;
        currentAudio = null;
        URL.revokeObjectURL(url); // Cleanup memory
        if (onComplete) onComplete();
    };
    
    audio.onerror = (e) => {
        console.error("Audio Playback Error", e);
        isInternalPlaying = false;
        currentAudio = null;
        URL.revokeObjectURL(url);
        if (onComplete) onComplete();
    }

    audio.play().catch(e => {
        console.error("Play failed:", e);
        if (onComplete) onComplete();
    });
};

export const stopAudio = () => {
    isInternalPlaying = false;
    queue = [];
    onCompleteGlobal = null;
    
    // Stop Web Speech
    if (synth) synth.cancel();

    // Stop HTML Audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
};
