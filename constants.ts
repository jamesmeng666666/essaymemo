
import { Essay, Token, PartOfSpeech, Sentence } from "./types";
import { v4 as uuidv4 } from 'uuid';

// --- Local Dictionary for Offline Initialization ---
const NOUNS = new Set([
  "nie", "er", "yunnan", "talent", "music", "age", "song", "skill", "ears", "people", "nickname", "erduo", "name", "composer", "life", "works", "suffering", "achievement", "anthem", "nation", "hero", "year", "base", "tourists", "numbers", "january", "february", "march", "april", "may", "june", "satisfaction", "survey", "graph", "news", "experiences", "time", "situation", "areas", "guidance", "measures", "everyone", "opinions", "ai", "tools", "mistakes", "information", "answer", "problem", "coin", "sides", "effects", "ability", "communication", "teachers", "classmates", "run", "payment", "invention", "money", "convenience", "wallets", "cards", "qr", "code", "records", "app", "spending", "disadvantages", "smartphones", "network", "failures", "trouble", "addition", "things", "drawbacks", "mr", "mrs", "li", "thanks", "everything", "stay", "shenzhen", "home", "care", "help", "bikes", "culture", "lion", "dance", "festival", "dumplings", "highlight", "traditions", "kindness", "support", "touch", "uk", "wishes", "peter", "wisdom", "today", "story", "zhuge", "liang", "city", "plan", "period", "general", "shu", "day", "soldiers", "army", "idea", "gates", "streets", "wall", "zither", "smile", "ambush", "technique", "repetition", "words", "intervals", "process", "memory", "role", "confidence", "goals", "pets", "part", "family", "happiness", "companions", "elderly", "children", "school", "work", "responsibility", "others", "night", "neighbors", "waste", "problems", "cost", "food", "joy", "opinion", "way"
]);

const VERBS = new Set([
  "born", "showed", "pick", "hearing", "moving", "gave", "adopted", "created", "composing", "encouraged", "fight", "passed", "lived", "respect", "remember", "attracted", "recorded", "conducted", "rose", "fell", "peaked", "dropped", "shown", "enjoyed", "plan", "add", "reduce", "provide", "believe", "attract", "satisfy", "stand", "share", "check", "correct", "save", "providing", "explain", "arrive", "brings", "makes", "noticed", "reduces", "help", "learn", "use", "changed", "manage", "need", "carry", "scanning", "pay", "stored", "keeping", "keep", "find", "cause", "lead", "spend", "buy", "hope", "writing", "express", "done", "feel", "arrived", "given", "taught", "adapted", "using", "riding", "watching", "making", "become", "understand", "welcome", "going", "go", "left", "came", "attack", "ordered", "let", "pretend", "sweep", "sat", "playing", "thought", "marched", "tells", "think", "review", "forget", "tend", "move", "build", "achieve", "is", "are", "was", "were", "am", "be", "been", "has", "have", "had", "do", "does", "did", "can", "could", "will", "would", "should", "may", "might", "must"
]);

const ADJS = new Set([
  "extraordinary", "special", "formal", "gifted", "ordinary", "greatest", "young", "beloved", "national", "intangible", "cultural", "large", "first", "second", "good", "small", "long", "detailed", "glad", "challenging", "negative", "lazier", "bad", "harmful", "mobile", "convenient", "heavy", "unfamiliar", "poor", "unnecessary", "useful", "kind", "digital", "traditional", "fantastic", "another", "smart", "weak", "scared", "calm", "brilliant", "empty", "few", "old", "new", "right", "same", "short-term", "long-term", "important", "proud", "lovely", "less", "lonely", "noisy", "environmental", "medical", "high", "proper", "clean", "healthy", "well-trained"
]);

const ADVS = new Set([
  "originally", "mainly", "especially", "also", "completely", "totally", "quickly", "too", "much", "moreover", "however", "actually", "really", "wisely", "so", "well", "very", "just", "once", "twice", "later", "sadly", "heavily", "sharply", "simply", "automatically", "often", "even", "never", "always", "properly", "naturally", "besides", "recently", "finally", "suddenly", "meanwhile"
]);

// --- Helper to Generate Initial Tokens ---
const mockTokenize = (text: string): Token[] => {
    // Split by spaces, newlines, and punctuation while keeping them
    const regex = /([a-zA-Z0-9']+|[\n]+|[.,!?;:()"]+)/g;
    const parts = text.split(regex).filter(p => p.length > 0);
    
    return parts.map((part, index) => {
        const lower = part.toLowerCase().replace(/[^a-z]/g, "");
        const isSeparator = !/[a-zA-Z0-9]/.test(part);
        
        let pos: PartOfSpeech = 'other';
        
        if (!isSeparator) {
            if (NOUNS.has(lower) || (lower.endsWith('s') && NOUNS.has(lower.slice(0, -1)))) pos = 'noun';
            else if (VERBS.has(lower) || (lower.endsWith('ed') && VERBS.has(lower.slice(0, -2))) || (lower.endsWith('ing') && VERBS.has(lower.slice(0, -3)))) pos = 'verb';
            else if (ADJS.has(lower)) pos = 'adj';
            else if (ADVS.has(lower)) pos = 'adv';
        }

        // Special spacing handling: if the part is not a separator and the previous one wasn't a separator (and not empty), add a space token before it? 
        // Actually, the regex split preserves spaces if we include \s in the capturing group. 
        // Let's adjust regex to capture whitespace.
        
        return {
            id: `init-${index}-${Math.random().toString(36).substr(2, 5)}`,
            text: part,
            pos,
            isSeparator
        };
    });
};

// Improved Tokenizer that handles whitespace correctly
const smartTokenize = (text: string): Token[] => {
   const tokens: Token[] = [];
   // Match: Words OR Newlines OR Punctuation OR Spaces
   const regex = /([a-zA-Z0-9']+|[\n]+|[.,!?;:()"]+|\s+)/g; 
   const matches = text.match(regex);
   
   if (matches) {
       matches.forEach((part, index) => {
           const lower = part.toLowerCase();
           const isWord = /^[a-z0-9']+$/i.test(part);
           const isSpace = /^\s+$/.test(part);
           const isPunct = /^[.,!?;:()"]+$/.test(part);
           
           let pos: PartOfSpeech = 'other';
           if (isWord) {
                // Heuristic checks
                if (NOUNS.has(lower) || (lower.endsWith('s') && NOUNS.has(lower.slice(0, -1)))) pos = 'noun';
                else if (VERBS.has(lower) || (lower.endsWith('ed') && VERBS.has(lower.slice(0, -2))) || (lower.endsWith('ing') && VERBS.has(lower.slice(0, -3)))) pos = 'verb';
                else if (ADJS.has(lower)) pos = 'adj';
                else if (ADVS.has(lower)) pos = 'adv';
           }

           tokens.push({
               id: `t-${index}-${Date.now()}`,
               text: part,
               pos: pos,
               isSeparator: !isWord
           });
       });
   }
   return tokens;
};

// Mock Sentences (Placeholder as we focus on memorization first)
const mockSentences = (text: string): Sentence[] => {
    // Simple split by period for mock translation data
    return text.split('.').filter(s => s.trim().length > 5).map((s, i) => ({
        id: `s-${i}`,
        english: s.trim() + '.',
        chinese: "Click 'Read' or 'Translate' to see analysis (Requires API for full accuracy)" 
    }));
};


const RAW_ESSAYS = [
    {
        title: "8AU1: Nie Er",
        content: `Nie Er, originally named Nie Shouxin, was born in Yunnan in 1912. He showed extraordinary talent in music from an early age. He could pick up any song after hearing it just once or twice. Besides, he had a special skill of moving his ears, so people gave him the nickname "Erduo", which he later adopted as his formal name. 

As a gifted composer, Nie Er created over 30 songs during his life. Many of these works showed ordinary people's suffering. His greatest achievement is composing the music for China's national anthem, which encouraged people to fight for the nation. 

Sadly, Nie Er passed away at the young age of 23. However, his music has lived on. People respect him as "the People's Musician" and remember him as a beloved national hero.`
    },
    {
        title: "8AU2: Intangible Cultural Heritage",
        content: `This year, our Intangible Cultural Heritage Experience Base has attracted a large number of tourists. We recorded the monthly tourist numbers from January to June and conducted a tourist satisfaction survey. 

According to the first graph, there were about 25,000 tourists in January and 22,000 in February. The number rose to 35,000 in March, fell to 22,000 in April, then peaked at 40,000 in May. It dropped sharply to 20,000 in June. 

The good news, shown in the second graph, is that over 80% of the tourists enjoyed their experiences very much. However, a small number of tourists were not satisfied due to the long waiting time. 

To improve the situation, we plan to add more activity areas to reduce waiting time. Also, we will provide more detailed guidance for tourists. We believe these measures will attract and satisfy more tourists.`
    },
    {
        title: "8AU3: AI in Studies",
        content: `Hello, everyone! I'm very glad to stand here and share my opinions of using AI in studies. 

First, AI tools can help me check for mistakes and correct them. Besides, they help me save time by providing information quickly. What's more, an AI tool can provide the answer to a challenging maths problem and explain how to arrive at the answer step by step. 

Every coin has two sides. AI also brings some negative effects. Using AI too much makes me lazier than before. Moreover, it is bad for improving my ability to think and solve problems. Worst of all, I've noticed that AI reduces my face-to-face communication with teachers and classmates. All these are harmful to me in the long run. 

In short, AI tools can help us learn better and faster, but we must use them wisely. Only in this way can we make good use of AI in our studies.`
    },
    {
        title: "8AU4: Mobile Payment",
        content: `Mobile payment is one of the most wonderful inventions, which has totally changed how people manage money in daily life. 

It brings great convenience to us. We no longer need to carry heavy wallets or bank cards. Besides, it helps us save time by scanning a QR code to pay quickly. What's more, all payment records are stored in the app automatically, making it easier to keep track of our spending. 

However, it has some disadvantages. Elderly people and those who are unfamiliar with smartphones find it difficult to use. Also, poor network may cause payment failures and trouble. In addition, it might lead to overspending because people might spend less carefully and buy unnecessary things. 

In short, despite its drawbacks, mobile payment is really a useful invention. We should learn to use it wisely.`
    },
    {
        title: "8AU5: Letter to Mr and Mrs Li",
        content: `Dear Mr and Mrs Li,

I hope you are doing well. I'm writing to express my thanks to you for everything you have done during my stay in Shenzhen. 

It was so kind of you to make me feel at home. When I arrived in Shenzhen, everything was unfamiliar to me. However, you have given me a lot of care and taught me some Chinese. Thanks to your help, I have adapted to the digital life so quickly, from using mobile payment to riding shared bikes. 

What's more, it was fantastic to learn about traditional culture with you. I especially enjoyed watching the lion dance during the Spring Festival. Making dumplings together has become another highlight that helped me understand Chinese traditions better. 

Thank you again for your kindness and support! I do hope that we can stay in touch all the time. Welcome to the UK someday! 

Best wishes,
Peter`
    },
    {
        title: "8AU6: Empty City Plan",
        content: `Good morning, everyone! Welcome to Wisdom Today. I'm going to share the story of Zhuge Liang's Empty City Plan with you. 

During the Three Kingdoms Period, Zhuge Liang was a smart general of Shu. One day, most of his soldiers went out to fight while only a few old and weak soldiers were left. Suddenly, Sima Yi's large army came to attack it. 

Everyone in the city felt very scared, but Zhuge Liang stayed calm. He came up with a brilliant idea that he ordered soldiers to open the city gates and let some of them pretend to sweep the streets slowly. Meanwhile, he sat on the city wall, playing the zither with a peaceful smile. Sima Yi thought there was an ambush, so he marched his army away. 

This story tells us that we should think wisely when we are in trouble because nothing is more powerful than wisdom.`
    },
    {
        title: "8AU7: Spaced Repetition",
        content: `Hi, everyone! Today, I'd like to share a useful memory technique - spaced repetition. 

When we learn something new, like English words, we often tend to forget them quickly. Spaced repetition can help us. The key is to review the information at right intervals. First, review the information on the same day we learn it. Then check it again after 24 hours. A week later, make a point of going over it once more. And finally, review it after 30 days. This process helps move knowledge from our short-term memory to long-term memory. 

Spaced repetition can play an important role in our studies. It can not only help us save time by reviewing the things we need to remember regularly, but also build our confidence because a good memory will make us feel proud. 

So, let's give spaced repetition a try! I'm sure it will help us achieve our learning goals.`
    },
    {
        title: "8AU8: Pets",
        content: `Recently, more and more young people like to keep pets. Some of them think their pets are part of the family. 

People keep pets mainly because they are lovely and can bring happiness. Pets are good companions, especially for the elderly and children, helping them feel less lonely. Playing with pets after school or work can help us relax. Moreover, taking care of pets teaches us responsibility and how to care for others. 

However, keeping pets also has its downsides. Pets can be noisy at night, which may disturb neighbors. Some pets might even attack people. Besides, they need to be cleaned often, and their waste can cause environmental problems. The cost of food and medical care for pets can also be high. 

In my opinion, keeping pets is a good idea if we can take proper care of them. We should make sure they are clean, healthy, and well-trained. By this way, pets can bring us joy without causing trouble to others.`
    }
];

export const INITIAL_ESSAYS: Essay[] = RAW_ESSAYS.map(raw => ({
    id: uuidv4(),
    title: raw.title,
    rawContent: raw.content,
    tokens: smartTokenize(raw.content),
    sentences: mockSentences(raw.content), // Placeholder sentences
    isAnalyzed: true, // Marked as true so it displays immediately
    createdAt: Date.now()
}));
