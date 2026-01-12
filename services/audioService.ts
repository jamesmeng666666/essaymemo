
// Utility to handle Text-to-Speech using native Web Speech API
// This works offline and in regions where Google APIs are blocked (e.g. China).

let synth: SpeechSynthesis | null = null;
if (typeof window !== "undefined") {
  synth = window.speechSynthesis;
}

let queue: string[] = [];
let onCompleteGlobal: (() => void) | null = null;
let isInternalPlaying = false;

// Helper to get the best available English voice
const getEnglishVoice = (): SpeechSynthesisVoice | null => {
  if (!synth) return null;
  const voices = synth.getVoices();
  
  // Priority list for "Human-like" voices
  return (
    voices.find((v) => v.name === "Google US English") ||
    voices.find((v) => v.name.includes("Samantha")) || // iOS/macOS High quality
    voices.find((v) => v.name.includes("Daniel")) ||   // iOS/macOS High quality
    voices.find((v) => v.name.includes("Microsoft Zira")) || // Windows
    voices.find((v) => v.lang === "en-US") ||
    voices.find((v) => v.lang.startsWith("en")) ||
    null
  );
};

// Split text into meaningful chunks (sentences) to prevent browser TTS from cutting off long text
const chunkText = (text: string): string[] => {
  // Regex: Split by [.!?] followed by whitespace or EOF, but keep the delimiter.
  // This is a basic sentence splitter.
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
    if (voice) {
        utterance.voice = voice;
    }
    
    // Adjust for natural reading speed
    utterance.rate = 0.9; 
    utterance.pitch = 1.0;

    utterance.onend = () => {
        // Recursively play next chunk
        speakNext();
    };

    utterance.onerror = (e) => {
        console.error("TTS Error:", e);
        // Continue to next chunk even if one fails
        speakNext();
    };

    synth.speak(utterance);
};

export const playText = (text: string, onComplete?: () => void) => {
    if (!synth) {
        console.warn("Speech Synthesis not supported in this browser.");
        if (onComplete) onComplete();
        return;
    }

    // Stop any current playback
    stopAudio();

    queue = chunkText(text);
    onCompleteGlobal = onComplete || null;
    isInternalPlaying = true;

    // Chrome specific: voices might load asynchronously
    if (synth.getVoices().length === 0) {
        const tempHandler = () => {
            synth!.onvoiceschanged = null;
            if (isInternalPlaying) speakNext();
        };
        synth.onvoiceschanged = tempHandler;
        // Fallback: try speaking anyway after short delay if event doesn't fire
        setTimeout(() => {
            if (isInternalPlaying && synth!.speaking === false) speakNext();
        }, 100);
    } else {
        speakNext();
    }
};

export const stopAudio = () => {
    isInternalPlaying = false;
    queue = [];
    if (synth) {
        synth.cancel();
    }
    // We do NOT call onCompleteGlobal here to avoid loops or side effects during manual stop
    onCompleteGlobal = null;
};

// For backward compatibility / safety
export const getAudioContext = () => null; 
export const decodeAudioData = async () => ({} as AudioBuffer);
export const playAudioBuffer = async () => {};
