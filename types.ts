
export type PartOfSpeech = 'noun' | 'verb' | 'adj' | 'adv' | 'other';

export interface Token {
  id: string;
  text: string;
  pos: PartOfSpeech;
  isSeparator?: boolean; // spaces, punctuation, newlines
}

export interface Sentence {
  id: string;
  english: string;
  chinese: string;
}

export interface Essay {
  id: string;
  title: string;
  rawContent: string;
  tokens: Token[];
  sentences?: Sentence[]; 
  isAnalyzed: boolean;
  createdAt: number;
}

export enum PracticeMode {
  READ = 'READ',
  LEVEL_1 = 'LEVEL_1', // Nouns
  LEVEL_2 = 'LEVEL_2', // Nouns + Verbs
  LEVEL_3 = 'LEVEL_3', // Nouns + Verbs + Adj + Adv
  TRANSLATION = 'TRANSLATION', // New mode: Chinese to English
}

export interface UserAnswers {
  [tokenId: string]: string;
}

export interface VerificationResult {
  [tokenId: string]: boolean;
}
