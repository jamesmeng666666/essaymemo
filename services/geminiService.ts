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

export const analyzeTextForMemorization = async (text: string): Promise<Token[]> => {
  const ai = getClient();
  
  // We need a structured response to identify Nouns, Verbs, Adjectives, Adverbs
  // while preserving the EXACT structure of the text (including punctuation) for reconstruction.
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
      Return a JSON array where each object has "english" and "chinese".
      
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
                            chinese: { type: Type.STRING }
                        },
                        required: ['english', 'chinese']
                    }
                }
            }
        });

        const data = JSON.parse(response.text || '[]');
        return data.map((item: any, idx: number) => ({
            id: `sent-${idx}-${Date.now()}`,
            english: item.english,
            chinese: item.chinese
        }));

    } catch (error) {
        console.error("Gemini Translation Analysis Failed:", error);
        // Fallback or rethrow
        throw error;
    }
}
