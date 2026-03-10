
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

// Data Structure for Pre-defined Essays
const RAW_ESSAYS = [
    {
        title: "8AU1: Nie Er",
        audioPath: "/audio/nie_er.wav",
        content: `Nie Er, originally named Nie Shouxin, was born in Yunnan in 1912. He showed extraordinary talent in music from an early age. He could pick up any song after hearing it just once or twice. Besides, he had a special skill of moving his ears, so people gave him the nickname "Erduo", which he later adopted as his formal name. 

As a gifted composer, Nie Er created over 30 songs during his life. Many of these works showed ordinary people's suffering. His greatest achievement is composing the music for China's national anthem, which encouraged people to fight for the nation. 

Sadly, Nie Er passed away at the young age of 23. However, his music has lived on. People respect him as "the People's Musician" and remember him as a beloved national hero.`,
        sentences: [
            { english: "Nie Er, originally named Nie Shouxin, was born in Yunnan in 1912.", chinese: "聂耳，原名聂守信，1912年出生于云南。" },
            { english: "He showed extraordinary talent in music from an early age.", chinese: "他从小就表现出非凡的音乐天赋。" },
            { english: "He could pick up any song after hearing it just once or twice.", chinese: "任何歌曲他听一两遍就能学会。" },
            { english: "Besides, he had a special skill of moving his ears, so people gave him the nickname \"Erduo\", which he later adopted as his formal name.", chinese: "此外，他还有一种动耳朵的特殊技能，所以人们给他起了个绰号叫“耳朵”，后来他把它作为了自己的正式名字。" },
            { english: "As a gifted composer, Nie Er created over 30 songs during his life.", chinese: "作为一位天才作曲家，聂耳一生创作了30多首歌曲。" },
            { english: "Many of these works showed ordinary people's suffering.", chinese: "其中许多作品展现了普通百姓的苦难。" },
            { english: "His greatest achievement is composing the music for China's national anthem, which encouraged people to fight for the nation.", chinese: "他最大的成就是为中国国歌谱曲，激励人们为国家而战。" },
            { english: "Sadly, Nie Er passed away at the young age of 23.", chinese: "遗憾的是，聂耳在23岁时英年早逝。" },
            { english: "However, his music has lived on.", chinese: "然而，他的音乐却流传了下来。" },
            { english: "People respect him as \"the People's Musician\" and remember him as a beloved national hero.", chinese: "人们尊称他为“人民音乐家”，并铭记他为受人爱戴的民族英雄。" }
        ]
    },
    {
        title: "8AU2: Intangible Cultural Heritage",
        audioPath: "/audio/cultural_heritage.wav",
        content: `This year, our Intangible Cultural Heritage Experience Base has attracted a large number of tourists. We recorded the monthly tourist numbers from January to June and conducted a tourist satisfaction survey. 

According to the first graph, there were about 25,000 tourists in January and 22,000 in February. The number rose to 35,000 in March, fell to 22,000 in April, then peaked at 40,000 in May. It dropped sharply to 20,000 in June. 

The good news, shown in the second graph, is that over 80% of the tourists enjoyed their experiences very much. However, a small number of tourists were not satisfied due to the long waiting time. 

To improve the situation, we plan to add more activity areas to reduce waiting time. Also, we will provide more detailed guidance for tourists. We believe these measures will attract and satisfy more tourists.`,
        sentences: [
            { english: "This year, our Intangible Cultural Heritage Experience Base has attracted a large number of tourists.", chinese: "今年，我们的非物质文化遗产体验基地吸引了大量游客。" },
            { english: "We recorded the monthly tourist numbers from January to June and conducted a tourist satisfaction survey.", chinese: "我们记录了1月至6月的月度游客人数，并进行了游客满意度调查。" },
            { english: "According to the first graph, there were about 25,000 tourists in January and 22,000 in February.", chinese: "根据第一张图表，1月份的游客约为25,000人，2月份约为22,000人。" },
            { english: "The number rose to 35,000 in March, fell to 22,000 in April, then peaked at 40,000 in May.", chinese: "3月份人数升至35,000人，4月份降至22,000人，然后在5月份达到40,000人的峰值。" },
            { english: "It dropped sharply to 20,000 in June.", chinese: "6月份急剧下降至20,000人。" },
            { english: "The good news, shown in the second graph, is that over 80% of the tourists enjoyed their experiences very much.", chinese: "第二张图表显示的好消息是，超过80%的游客非常享受他们的体验。" },
            { english: "However, a small number of tourists were not satisfied due to the long waiting time.", chinese: "然而，由于等待时间长，少数游客表示不满意。" },
            { english: "To improve the situation, we plan to add more activity areas to reduce waiting time.", chinese: "为了改善这种情况，我们计划增加更多的活动区域以减少等待时间。" },
            { english: "Also, we will provide more detailed guidance for tourists.", chinese: "此外，我们将为游客提供更详细的指导。" },
            { english: "We believe these measures will attract and satisfy more tourists.", chinese: "我们相信这些措施将吸引并满足更多的游客。" }
        ]
    },
    {
        title: "8AU3: AI in Studies",
        audioPath: "/audio/ai_in_studies.wav",
        content: `Hello, everyone! I'm very glad to stand here and share my opinions of using AI in studies. 

First, AI tools can help me check for mistakes and correct them. Besides, they help me save time by providing information quickly. What's more, an AI tool can provide the answer to a challenging maths problem and explain how to arrive at the answer step by step. 

Every coin has two sides. AI also brings some negative effects. Using AI too much makes me lazier than before. Moreover, it is bad for improving my ability to think and solve problems. Worst of all, I've noticed that AI reduces my face-to-face communication with teachers and classmates. All these are harmful to me in the long run. 

In short, AI tools can help us learn better and faster, but we must use them wisely. Only in this way can we make good use of AI in our studies.`,
        sentences: [
             { english: "Hello, everyone! I'm very glad to stand here and share my opinions of using AI in studies.", chinese: "大家好！很高兴站在这里分享我对在学习中使用人工智能的看法。" },
             { english: "First, AI tools can help me check for mistakes and correct them.", chinese: "首先，人工智能工具可以帮我检查错误并加以改正。" },
             { english: "Besides, they help me save time by providing information quickly.", chinese: "此外，它们能快速提供信息，帮我节省时间。" },
             { english: "What's more, an AI tool can provide the answer to a challenging maths problem and explain how to arrive at the answer step by step.", chinese: "更重要的是，人工智能工具可以提供数学难题的答案，并一步步解释如何得出答案。" },
             { english: "Every coin has two sides. AI also brings some negative effects.", chinese: "凡事都有两面性。人工智能也带来了一些负面影响。" },
             { english: "Using AI too much makes me lazier than before.", chinese: "过度使用人工智能让我比以前更懒惰了。" },
             { english: "Moreover, it is bad for improving my ability to think and solve problems.", chinese: "而且，这对提高我的思考和解决问题的能力很不利。" },
             { english: "Worst of all, I've noticed that AI reduces my face-to-face communication with teachers and classmates.", chinese: "最糟糕的是，我发现人工智能减少了我与老师和同学的面对面交流。" },
             { english: "All these are harmful to me in the long run.", chinese: "从长远来看，这些对我都是有害的。" },
             { english: "In short, AI tools can help us learn better and faster, but we must use them wisely.", chinese: "总之，人工智能工具可以帮助我们更好、更快地学习，但我们必须明智地使用它们。" },
             { english: "Only in this way can we make good use of AI in our studies.", chinese: "只有这样，我们才能在学习中利用好人工智能。" }
        ]
    },
    {
        title: "8AU4: Mobile Payment",
        audioPath: "/audio/mobile_payment.wav",
        content: `Mobile payment is one of the most wonderful inventions, which has totally changed how people manage money in daily life. 

It brings great convenience to us. We no longer need to carry heavy wallets or bank cards. Besides, it helps us save time by scanning a QR code to pay quickly. What's more, all payment records are stored in the app automatically, making it easier to keep track of our spending. 

However, it has some disadvantages. Elderly people and those who are unfamiliar with smartphones find it difficult to use. Also, poor network may cause payment failures and trouble. In addition, it might lead to overspending because people might spend less carefully and buy unnecessary things. 

In short, despite its drawbacks, mobile payment is really a useful invention. We should learn to use it wisely.`,
        sentences: [
            { english: "Mobile payment is one of the most wonderful inventions, which has totally changed how people manage money in daily life.", chinese: "移动支付是最奇妙的发明之一，它彻底改变了人们在日常生活中管理金钱的方式。" },
            { english: "It brings great convenience to us.", chinese: "它给我们带来了极大的便利。" },
            { english: "We no longer need to carry heavy wallets or bank cards.", chinese: "我们不再需要携带厚重的钱包或银行卡。" },
            { english: "Besides, it helps us save time by scanning a QR code to pay quickly.", chinese: "此外，通过扫描二维码快速支付，它帮助我们节省了时间。" },
            { english: "What's more, all payment records are stored in the app automatically, making it easier to keep track of our spending.", chinese: "更重要的是，所有支付记录都会自动存储在应用程序中，使我们更容易追踪开支。" },
            { english: "However, it has some disadvantages.", chinese: "然而，它也有一些缺点。" },
            { english: "Elderly people and those who are unfamiliar with smartphones find it difficult to use.", chinese: "老年人和不熟悉智能手机的人觉得使用起来很困难。" },
            { english: "Also, poor network may cause payment failures and trouble.", chinese: "此外，糟糕的网络可能会导致支付失败和麻烦。" },
            { english: "In addition, it might lead to overspending because people might spend less carefully and buy unnecessary things.", chinese: "另外，它可能会导致过度消费，因为人们可能会花钱不那么谨慎，购买不必要的东西。" },
            { english: "In short, despite its drawbacks, mobile payment is really a useful invention.", chinese: "总之，尽管有缺点，移动支付确实是一项有用的发明。" },
            { english: "We should learn to use it wisely.", chinese: "我们应该学会明智地使用它。" }
        ]
    },
    {
        title: "8AU5: Letter to Mr and Mrs Li",
        audioPath: "/audio/letter_to_li.wav",
        content: `Dear Mr and Mrs Li,

I hope you are doing well. I'm writing to express my thanks to you for everything you have done during my stay in Shenzhen. 

It was so kind of you to make me feel at home. When I arrived in Shenzhen, everything was unfamiliar to me. However, you have given me a lot of care and taught me some Chinese. Thanks to your help, I have adapted to the digital life so quickly, from using mobile payment to riding shared bikes. 

What's more, it was fantastic to learn about traditional culture with you. I especially enjoyed watching the lion dance during the Spring Festival. Making dumplings together has become another highlight that helped me understand Chinese traditions better. 

Thank you again for your kindness and support! I do hope that we can stay in touch all the time. Welcome to the UK someday! 

Best wishes,
Peter`,
        sentences: [
            { english: "I hope you are doing well.", chinese: "希望你们一切安好。" },
            { english: "I'm writing to express my thanks to you for everything you have done during my stay in Shenzhen.", chinese: "我写这封信是为了感谢你们在我逗留深圳期间所做的一切。" },
            { english: "It was so kind of you to make me feel at home.", chinese: "你们让我感觉像在家里一样，真是太好了。" },
            { english: "When I arrived in Shenzhen, everything was unfamiliar to me.", chinese: "当我到达深圳时，一切对我来说都很陌生。" },
            { english: "However, you have given me a lot of care and taught me some Chinese.", chinese: "然而，你们给了我很多关照，还教了我一些中文。" },
            { english: "Thanks to your help, I have adapted to the digital life so quickly, from using mobile payment to riding shared bikes.", chinese: "多亏了你们的帮助，我很快适应了数字生活，从使用移动支付到骑共享单车。" },
            { english: "What's more, it was fantastic to learn about traditional culture with you.", chinese: "更棒的是，能和你们一起学习传统文化真是太好了。" },
            { english: "I especially enjoyed watching the lion dance during the Spring Festival.", chinese: "我特别喜欢春节期间看舞狮。" },
            { english: "Making dumplings together has become another highlight that helped me understand Chinese traditions better.", chinese: "一起包饺子成了另一个亮点，帮助我更好地了解中国传统。" },
            { english: "Thank you again for your kindness and support!", chinese: "再次感谢你们的善意和支持！" },
            { english: "I do hope that we can stay in touch all the time.", chinese: "我真心希望我们能一直保持联系。" },
            { english: "Welcome to the UK someday!", chinese: "欢迎有一天来英国！" }
        ]
    },
    {
        title: "8AU6: Empty City Plan",
        audioPath: "/audio/empty_city_plan.wav",
        content: `Good morning, everyone! Welcome to Wisdom Today. I'm going to share the story of Zhuge Liang's Empty City Plan with you. 

During the Three Kingdoms Period, Zhuge Liang was a smart general of Shu. One day, most of his soldiers went out to fight while only a few old and weak soldiers were left. Suddenly, Sima Yi's large army came to attack it. 

Everyone in the city felt very scared, but Zhuge Liang stayed calm. He came up with a brilliant idea that he ordered soldiers to open the city gates and let some of them pretend to sweep the streets slowly. Meanwhile, he sat on the city wall, playing the zither with a peaceful smile. Sima Yi thought there was an ambush, so he marched his army away. 

This story tells us that we should think wisely when we are in trouble because nothing is more powerful than wisdom.`,
        sentences: [
            { english: "Good morning, everyone! Welcome to Wisdom Today.", chinese: "大家早上好！欢迎来到《智慧今日》。" },
            { english: "I'm going to share the story of Zhuge Liang's Empty City Plan with you.", chinese: "我要和大家分享诸葛亮空城计的故事。" },
            { english: "During the Three Kingdoms Period, Zhuge Liang was a smart general of Shu.", chinese: "三国时期，诸葛亮是蜀国的一位聪明将领。" },
            { english: "One day, most of his soldiers went out to fight while only a few old and weak soldiers were left.", chinese: "有一天，他的大部分士兵都出去打仗了，只剩下一些老弱残兵。" },
            { english: "Suddenly, Sima Yi's large army came to attack it.", chinese: "突然，司马懿的大军来攻城。" },
            { english: "Everyone in the city felt very scared, but Zhuge Liang stayed calm.", chinese: "城里的每个人都很害怕，但诸葛亮保持镇定。" },
            { english: "He came up with a brilliant idea that he ordered soldiers to open the city gates and let some of them pretend to sweep the streets slowly.", chinese: "他想出了一个绝妙的主意，命令士兵打开城门，让其中一些人假装在慢慢扫街。" },
            { english: "Meanwhile, he sat on the city wall, playing the zither with a peaceful smile.", chinese: "与此同时，他坐在城墙上，带着平静的微笑弹琴。" },
            { english: "Sima Yi thought there was an ambush, so he marched his army away.", chinese: "司马懿以为有埋伏，就把军队撤走了。" },
            { english: "This story tells us that we should think wisely when we are in trouble because nothing is more powerful than wisdom.", chinese: "这个故事告诉我们，遇到困难要运用智慧，因为没有什么比智慧更强大。" }
        ]
    },
    {
        title: "8AU7: Spaced Repetition",
        audioPath: "/audio/spaced_repetition.wav",
        content: `Hi, everyone! Today, I'd like to share a useful memory technique - spaced repetition. 

When we learn something new, like English words, we often tend to forget them quickly. Spaced repetition can help us. The key is to review the information at right intervals. First, review the information on the same day we learn it. Then check it again after 24 hours. A week later, make a point of going over it once more. And finally, review it after 30 days. This process helps move knowledge from our short-term memory to long-term memory. 

Spaced repetition can play an important role in our studies. It can not only help us save time by reviewing the things we need to remember regularly, but also build our confidence because a good memory will make us feel proud. 

So, let's give spaced repetition a try! I'm sure it will help us achieve our learning goals.`,
        sentences: [
            { english: "Hi, everyone! Today, I'd like to share a useful memory technique - spaced repetition.", chinese: "大家好！今天，我想分享一种有用的记忆技巧——间隔重复。" },
            { english: "When we learn something new, like English words, we often tend to forget them quickly.", chinese: "当我们学习新东西时，比如英语单词，我们往往忘得很快。" },
            { english: "Spaced repetition can help us.", chinese: "间隔重复可以帮助我们。" },
            { english: "The key is to review the information at right intervals.", chinese: "关键是在适当的间隔复习信息。" },
            { english: "First, review the information on the same day we learn it.", chinese: "首先，在学习当天的同一天复习信息。" },
            { english: "Then check it again after 24 hours.", chinese: "然后在24小时后再次查看。" },
            { english: "A week later, make a point of going over it once more.", chinese: "一周后，务必再复习一遍。" },
            { english: "And finally, review it after 30 days.", chinese: "最后，在30天后复习。" },
            { english: "This process helps move knowledge from our short-term memory to long-term memory.", chinese: "这个过程有助于将知识从短期记忆转移到长期记忆。" },
            { english: "Spaced repetition can play an important role in our studies.", chinese: "间隔重复可以在我们的学习中发挥重要作用。" },
            { english: "It can not only help us save time by reviewing the things we need to remember regularly, but also build our confidence because a good memory will make us feel proud.", chinese: "它不仅可以通过定期复习我们需要记住的东西来帮助我们节省时间，还能建立我们的自信，因为好的记忆力会让我们感到自豪。" },
            { english: "So, let's give spaced repetition a try!", chinese: "所以，让我们试试间隔重复法吧！" },
            { english: "I'm sure it will help us achieve our learning goals.", chinese: "我相信它会帮助我们实现学习目标。" }
        ]
    },
    {
        title: "8AU8: Pets",
        audioPath: "/audio/pets.wav",
        content: `Recently, more and more young people like to keep pets. Some of them think their pets are part of the family. 

People keep pets mainly because they are lovely and can bring happiness. Pets are good companions, especially for the elderly and children, helping them feel less lonely. Playing with pets after school or work can help us relax. Moreover, taking care of pets teaches us responsibility and how to care for others. 

However, keeping pets also has its downsides. Pets can be noisy at night, which may disturb neighbors. Some pets might even attack people. Besides, they need to be cleaned often, and their waste can cause environmental problems. The cost of food and medical care for pets can also be high. 

In my opinion, keeping pets is a good idea if we can take proper care of them. We should make sure they are clean, healthy, and well-trained. By this way, pets can bring us joy without causing trouble to others.`,
        sentences: [
            { english: "Recently, more and more young people like to keep pets.", chinese: "最近，越来越多的年轻人喜欢养宠物。" },
            { english: "Some of them think their pets are part of the family.", chinese: "他们中的一些人认为宠物是家庭的一部分。" },
            { english: "People keep pets mainly because they are lovely and can bring happiness.", chinese: "人们养宠物主要是因为它们可爱，能带来快乐。" },
            { english: "Pets are good companions, especially for the elderly and children, helping them feel less lonely.", chinese: "宠物是很好的伴侣，特别是对于老人和孩子，帮助他们减少孤独感。" },
            { english: "Playing with pets after school or work can help us relax.", chinese: "放学或下班后和宠物一起玩可以帮助我们放松。" },
            { english: "Moreover, taking care of pets teaches us responsibility and how to care for others.", chinese: "此外，照顾宠物教会我们责任感以及如何关心他人。" },
            { english: "However, keeping pets also has its downsides.", chinese: "然而，养宠物也有其缺点。" },
            { english: "Pets can be noisy at night, which may disturb neighbors.", chinese: "宠物在晚上可能会很吵，这可能会打扰邻居。" },
            { english: "Some pets might even attack people.", chinese: "有些宠物甚至可能攻击人。" },
            { english: "Besides, they need to be cleaned often, and their waste can cause environmental problems.", chinese: "此外，它们需要经常清洁，它们的排泄物可能会引起环境问题。" },
            { english: "The cost of food and medical care for pets can also be high.", chinese: "宠物的食物和医疗费用也可能很高。" },
            { english: "In my opinion, keeping pets is a good idea if we can take proper care of them.", chinese: "在我看来，如果我们能妥善照顾它们，养宠物是个好主意。" },
            { english: "We should make sure they are clean, healthy, and well-trained.", chinese: "我们应该确保它们干净、健康并且训练有素。" },
            { english: "By this way, pets can bring us joy without causing trouble to others.", chinese: "通过这种方式，宠物可以给我们带来快乐，而不会给别人带来麻烦。" }
        ]
    },
    {
        title: "8BU1: Digital Life Buddy",
        audioPath: "/audio/digital_life_buddy.wav",
        content: `Dear Mr Smith,

I am writing to you about my plan to start a voluntary activity called "Digital Life Buddy". 

I've found that many elderly foreign residents in our community have difficulty using Chinese digital services like WeChat Pay, Didi, and hospital booking apps. My classmates and I are willing to help. 

In order to help them, we'll devote our spare time to offering one-to-one guidance. For instance, we'll teach them how to use these apps as well as solve their daily digital problems. Moreover, we'll prepare some notes in both English and Chinese to avoid confusion. 

We hope to hold this activity on Sunday at the community hall. Could you please give us permission to organize it? Thank you for your support! 

We look forward to your reply. 

Yours sincerely,
Li Hua`,
        sentences: [
            { english: "Dear Mr Smith,", chinese: "亲爱的史密斯先生，" },
            { english: "I am writing to you about my plan to start a voluntary activity called \"Digital Life Buddy\".", chinese: "我写信给您是关于我计划开展一项名为“数字生活伙伴”的志愿活动。" },
            { english: "I've found that many elderly foreign residents in our community have difficulty using Chinese digital services like WeChat Pay, Didi, and hospital booking apps.", chinese: "我发现我们社区的许多外国老年居民在使用微信支付、滴滴和医院预约等中国数字服务时遇到困难。" },
            { english: "My classmates and I are willing to help.", chinese: "我和我的同学很乐意帮忙。" },
            { english: "In order to help them, we'll devote our spare time to offering one-to-one guidance.", chinese: "为了帮助他们，我们将利用业余时间提供一对一的指导。" },
            { english: "For instance, we'll teach them how to use these apps as well as solve their daily digital problems.", chinese: "例如，我们将教他们如何使用这些应用程序，并解决他们日常的数字问题。" },
            { english: "Moreover, we'll prepare some notes in both English and Chinese to avoid confusion.", chinese: "此外，我们将准备中英文双语笔记以避免混淆。" },
            { english: "We hope to hold this activity on Sunday at the community hall.", chinese: "我们希望周日在社区大厅举行这项活动。" },
            { english: "Could you please give us permission to organize it?", chinese: "您能批准我们组织这项活动吗？" },
            { english: "Thank you for your support!", chinese: "感谢您的支持！" },
            { english: "We look forward to your reply.", chinese: "期待您的回复。" },
            { english: "Yours sincerely,", chinese: "您真诚的，" },
            { english: "Li Hua", chinese: "李华" }
        ]
    }
];

export const INITIAL_ESSAYS: Essay[] = RAW_ESSAYS.map(raw => ({
    id: uuidv4(),
    title: raw.title,
    rawContent: raw.content,
    tokens: smartTokenize(raw.content),
    sentences: raw.sentences.map((s, i) => ({ ...s, id: `s-${i}-${Date.now()}` })), // Use pre-defined sentences
    isAnalyzed: true, 
    createdAt: Date.now(),
    audioPath: raw.audioPath
}));
