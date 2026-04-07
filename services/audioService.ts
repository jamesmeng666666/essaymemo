
// Utility to handle Text-to-Speech using native Web Speech API (Fallback)
// AND WAV playback for cached Gemini audio (Primary High-Quality Offline).

let synth: SpeechSynthesis | null = null;
if (typeof window !== "undefined") {
  synth = window.speechSynthesis;
}

// Global state
let currentAudio: HTMLAudioElement | null = null;
if (typeof window !== "undefined") {
    currentAudio = new Audio();
}
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
  if (!text) return [];
  const rawSentences = text.match(/[^.!?\n]+[.!?\n]*/g) || [text];
  return rawSentences.map(s => s.trim()).filter(s => s.length > 0);
};

const speakNext = () => {
    if (!synth || queue.length === 0 || !isInternalPlaying) {
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
    
    utterance.onend = () => {
        if (isInternalPlaying) speakNext();
    };

    utterance.onerror = (e) => {
        // Ignore errors caused by manual cancellation/interruption
        if (e.error === 'canceled' || e.error === 'interrupted') {
            isInternalPlaying = false;
            return;
        }
        
        console.error("TTS Error:", e.error);
        
        // Attempt to continue to next sentence/chunk despite error
        if (isInternalPlaying) speakNext();
    };
    
    try {
        synth.speak(utterance);
    } catch (err) {
        console.error("synth.speak error", err);
        if (isInternalPlaying) speakNext();
    }
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
        let timeoutId: any;
        const tempHandler = () => {
            synth!.onvoiceschanged = null;
            clearTimeout(timeoutId);
            if (isInternalPlaying) speakNext();
        };
        synth.onvoiceschanged = tempHandler;
        // Extended timeout to 500ms to allow more time for voices to load
        timeoutId = setTimeout(() => {
            synth!.onvoiceschanged = null;
            if (isInternalPlaying && synth!.speaking === false) speakNext();
        }, 500);
    } else {
        speakNext();
    }
};

// --- WAV Playback Helper (Primary High Quality) ---

export const playWav = (wavData: ArrayBuffer, onComplete?: () => void) => {
    stopAudio();

    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    if (!currentAudio) currentAudio = new Audio();
    currentAudio.src = url;
    isInternalPlaying = true;

    currentAudio.onended = () => {
        isInternalPlaying = false;
        URL.revokeObjectURL(url); // Cleanup memory
        if (onComplete) onComplete();
    };
    
    currentAudio.onerror = (e) => {
        let message = "Unknown error";
        // Type guard: Check if e is an Event and has a target property (narrowing down from Event | string)
        if (typeof e === 'object' && e !== null && 'target' in e) {
             const target = e.target as HTMLAudioElement;
             if (target && target.error) message = target.error.message;
        } else if (typeof e === 'string') {
            message = e;
        }

        console.error("Audio Playback Error", message);
        isInternalPlaying = false;
        URL.revokeObjectURL(url);
        if (onComplete) onComplete();
    }

    currentAudio.play().catch(e => {
        console.error("Play failed:", e);
        if (onComplete) onComplete();
    });
};

export const playAudioFromURL = (url: string, onComplete?: () => void, onError?: () => void) => {
    stopAudio();

    if (!currentAudio) currentAudio = new Audio();
    currentAudio.src = url;
    isInternalPlaying = true;

    currentAudio.onended = () => {
        isInternalPlaying = false;
        if (onComplete) onComplete();
    };
    
    currentAudio.onerror = (e) => {
        let message = "Unknown error";
        // Type guard: Check if e is an Event and has a target property (narrowing down from Event | string)
        if (typeof e === 'object' && e !== null && 'target' in e) {
             const target = e.target as HTMLAudioElement;
             if (target && target.error) message = target.error.message;
        } else if (typeof e === 'string') {
            message = e;
        }
        
        console.error("File Playback Error", message);
        isInternalPlaying = false;
        if (onError) onError();
    }

    currentAudio.play().catch(e => {
        console.error("Play failed:", e);
        if (onError) onError();
    });
}

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
    }
};
