
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { Token, Sentence } from "../types";

// Note: In a production app, never expose API keys on the client side.
// This is for demonstration purposes or personal tools.
const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key is missing. Please set process.env.API_KEY.");
    }
    return new GoogleGenAI({ apiKey });
};

// Helper: Decode Base64 string to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const analyzeTextForMemorization = async (text: string): Promise<Token[]> => {
  const ai = getClient();
  
  const prompt = `
    Analyze the following English text for a fill-in-the-blank exercise.
    Break the text down into a sequence of tokens that can perfectly reconstruct the original text.
    
    For each token, assign a 'pos' (Part of Speech) from these categories:
    - 'noun'
    - 'verb' (including auxiliary verbs like 'is', 'are', 'can')
    - 'adj' (adjective)
    - 'adv' (adverb)
    - 'other' (prepositions, pronouns like 'it', 'they', conjunctions, articles, etc.)
    
    If the token is punctuation, space, or newline, label 'pos' as 'other' and mark 'isSeparator' as true.
    
    Text to analyze:
    """${text}"""
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        pos: { type: Type.STRING, enum: ['noun', 'verb', 'adj', 'adv', 'other'] },
                        isSeparator: { type: Type.BOOLEAN }
                    },
                    required: ['text', 'pos']
                }
            }
        }
    });

    const tokens = JSON.parse(response.text || '[]');
    
    // Add unique IDs to tokens for React keys
    return tokens.map((t: any, idx: number) => ({
        ...t,
        id: `token-${idx}-${Date.now()}`
    }));

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const analyzeTextForTranslation = async (text: string): Promise<Sentence[]> => {
    const ai = getClient();

    const prompt = `
      Split the following English text into individual sentences. 
      For each sentence, provide a natural Chinese translation.
      Also provide key grammar points (in Chinese) to help 8th-grade students remember the sentence.
      Return a JSON array where each object has "english", "chinese", and "grammarPoints".
      
      Text to process:
      """${text}"""
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            english: { type: Type.STRING },
                            chinese: { type: Type.STRING },
                            grammarPoints: { type: Type.STRING }
                        },
                        required: ['english', 'chinese', 'grammarPoints']
                    }
                }
            }
        });

        const data = JSON.parse(response.text || '[]');
        return data.map((item: any, idx: number) => ({
            id: `sent-${idx}-${Date.now()}`,
            english: item.english,
            chinese: item.chinese,
            grammarPoints: item.grammarPoints
        }));

    } catch (error) {
        console.error("Gemini Translation Analysis Failed:", error);
        throw error;
    }
}

export const generateSpeechForText = async (text: string): Promise<Uint8Array> => {
    const ai = getClient();

    // Use the specific TTS model
    const model = 'gemini-2.5-flash-preview-tts';
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [{ text: text }]
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // 'Kore' is a good, neutral voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data returned from Gemini.");
        }

        return base64ToUint8Array(base64Audio);

    } catch (error) {
        console.error("Gemini TTS Generation Failed:", error);
        throw error;
    }
}
