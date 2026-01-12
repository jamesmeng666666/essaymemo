import { Token, Sentence, PartOfSpeech } from "./types";

export const ESSAY_1_TITLE = "Unit 8: Pets";
export const ESSAY_1_CONTENT = `Recently, more and more young people like to keep pets. Some of them think their pets are part of the family.
People keep pets mainly because they are lovely and can bring happiness. Pets are good companions, especially for the elderly and children, helping them feel less lonely. Playing with pets after school or work can help us relax. Moreover, taking care of pets teaches us responsibility and how to care for others.
However, keeping pets also has its downsides. Pets can be noisy at night, which may disturb neighbors. Some pets might even attack people. Besides, they need to be cleaned often, and their waste can cause environmental problems. The cost of food and medical care for pets can also be high.
In my opinion, keeping pets is a good idea if we can take proper care of them. We should make sure they are clean, healthy, and well-trained. By this way, pets can bring us joy without causing trouble to others.`;

export const ESSAY_2_TITLE = "Unit 8: Peter's Email";
export const ESSAY_2_CONTENT = `Dear Mr and Mrs Li,
I hope you are doing well. I'm writing to express my thanks to you for everything you have done during my stay in Shenzhen.
It was so kind of you to make me feel at home. When I arrived in Shenzhen, everything was unfamiliar to me. However, you have given me a lot of care and taught me some Chinese. Thanks to your help, I have adapted to the digital life so quickly, from using mobile payment to riding shared bikes.
What's more, it was fantastic to learn about traditional culture with you. I especially enjoyed watching the lion dance during the Spring Festival. Making dumplings together has become another highlight that helped me understand Chinese traditions better.
Thank you again for your kindness and support! I do hope that we can stay in touch all the time. Welcome to the UK someday!
Best wishes,
Peter`;

// Helper to construct token quickly
const t = (text: string, pos: PartOfSpeech, isSeparator?: boolean): Omit<Token, 'id'> => ({ text, pos, isSeparator });
// Helper for space
const s = () => t(" ", "other", true);

export const ESSAY_1_PRE_DATA = {
    tokens: [
        t("Recently", "adv"), t(",", "other", true), s(), t("more", "adj"), s(), t("and", "other"), s(), t("more", "adj"), s(), t("young", "adj"), s(), t("people", "noun"), s(), t("like", "verb"), s(), t("to", "other"), s(), t("keep", "verb"), s(), t("pets", "noun"), t(".", "other", true), s(), t("Some", "other"), s(), t("of", "other"), s(), t("them", "other"), s(), t("think", "verb"), s(), t("their", "other"), s(), t("pets", "noun"), s(), t("are", "verb"), s(), t("part", "noun"), s(), t("of", "other"), s(), t("the", "other"), s(), t("family", "noun"), t(".", "other", true), t("\n", "other", true),
        
        t("People", "noun"), s(), t("keep", "verb"), s(), t("pets", "noun"), s(), t("mainly", "adv"), s(), t("because", "other"), s(), t("they", "other"), s(), t("are", "verb"), s(), t("lovely", "adj"), s(), t("and", "other"), s(), t("can", "verb"), s(), t("bring", "verb"), s(), t("happiness", "noun"), t(".", "other", true), s(), t("Pets", "noun"), s(), t("are", "verb"), s(), t("good", "adj"), s(), t("companions", "noun"), t(",", "other", true), s(), t("especially", "adv"), s(), t("for", "other"), s(), t("the", "other"), s(), t("elderly", "noun"), s(), t("and", "other"), s(), t("children", "noun"), t(",", "other", true), s(), t("helping", "verb"), s(), t("them", "other"), s(), t("feel", "verb"), s(), t("less", "adv"), s(), t("lonely", "adj"), t(".", "other", true), s(), t("Playing", "verb"), s(), t("with", "other"), s(), t("pets", "noun"), s(), t("after", "other"), s(), t("school", "noun"), s(), t("or", "other"), s(), t("work", "noun"), s(), t("can", "verb"), s(), t("help", "verb"), s(), t("us", "other"), s(), t("relax", "verb"), t(".", "other", true), s(), t("Moreover", "adv"), t(",", "other", true), s(), t("taking", "verb"), s(), t("care", "noun"), s(), t("of", "other"), s(), t("pets", "noun"), s(), t("teaches", "verb"), s(), t("us", "other"), s(), t("responsibility", "noun"), s(), t("and", "other"), s(), t("how", "adv"), s(), t("to", "other"), s(), t("care", "verb"), s(), t("for", "other"), s(), t("others", "noun"), t(".", "other", true), t("\n", "other", true),

        t("However", "adv"), t(",", "other", true), s(), t("keeping", "verb"), s(), t("pets", "noun"), s(), t("also", "adv"), s(), t("has", "verb"), s(), t("its", "other"), s(), t("downsides", "noun"), t(".", "other", true), s(), t("Pets", "noun"), s(), t("can", "verb"), s(), t("be", "verb"), s(), t("noisy", "adj"), s(), t("at", "other"), s(), t("night", "noun"), t(",", "other", true), s(), t("which", "other"), s(), t("may", "verb"), s(), t("disturb", "verb"), s(), t("neighbors", "noun"), t(".", "other", true), s(), t("Some", "other"), s(), t("pets", "noun"), s(), t("might", "verb"), s(), t("even", "adv"), s(), t("attack", "verb"), s(), t("people", "noun"), t(".", "other", true), s(), t("Besides", "adv"), t(",", "other", true), s(), t("they", "other"), s(), t("need", "verb"), s(), t("to", "other"), s(), t("be", "verb"), s(), t("cleaned", "verb"), s(), t("often", "adv"), t(",", "other", true), s(), t("and", "other"), s(), t("their", "other"), s(), t("waste", "noun"), s(), t("can", "verb"), s(), t("cause", "verb"), s(), t("environmental", "adj"), s(), t("problems", "noun"), t(".", "other", true), s(), t("The", "other"), s(), t("cost", "noun"), s(), t("of", "other"), s(), t("food", "noun"), s(), t("and", "other"), s(), t("medical", "adj"), s(), t("care", "noun"), s(), t("for", "other"), s(), t("pets", "noun"), s(), t("can", "verb"), s(), t("also", "adv"), s(), t("be", "verb"), s(), t("high", "adj"), t(".", "other", true), t("\n", "other", true),

        t("In", "other"), s(), t("my", "other"), s(), t("opinion", "noun"), t(",", "other", true), s(), t("keeping", "verb"), s(), t("pets", "noun"), s(), t("is", "verb"), s(), t("a", "other"), s(), t("good", "adj"), s(), t("idea", "noun"), s(), t("if", "other"), s(), t("we", "other"), s(), t("can", "verb"), s(), t("take", "verb"), s(), t("proper", "adj"), s(), t("care", "noun"), s(), t("of", "other"), s(), t("them", "other"), t(".", "other", true), s(), t("We", "other"), s(), t("should", "verb"), s(), t("make", "verb"), s(), t("sure", "adj"), s(), t("they", "other"), s(), t("are", "verb"), s(), t("clean", "adj"), t(",", "other", true), s(), t("healthy", "adj"), t(",", "other", true), s(), t("and", "other"), s(), t("well-trained", "adj"), t(".", "other", true), s(), t("By", "other"), s(), t("this", "other"), s(), t("way", "noun"), t(",", "other", true), s(), t("pets", "noun"), s(), t("can", "verb"), s(), t("bring", "verb"), s(), t("us", "other"), s(), t("joy", "noun"), s(), t("without", "other"), s(), t("causing", "verb"), s(), t("trouble", "noun"), s(), t("to", "other"), s(), t("others", "noun"), t(".", "other", true)
    ],
    sentences: [
        { english: "Recently, more and more young people like to keep pets.", chinese: "最近，越来越多的年轻人喜欢养宠物。" },
        { english: "Some of them think their pets are part of the family.", chinese: "他们中的一些人认为宠物是家庭的一部分。" },
        { english: "People keep pets mainly because they are lovely and can bring happiness.", chinese: "人们养宠物主要是因为它们很可爱，能带来快乐。" },
        { english: "Pets are good companions, especially for the elderly and children, helping them feel less lonely.", chinese: "宠物是很好的伴侣，尤其是对老人和孩子来说，可以帮助他们减少孤独感。" },
        { english: "Playing with pets after school or work can help us relax.", chinese: "放学或下班后和宠物玩耍可以帮助我们放松。" },
        { english: "Moreover, taking care of pets teaches us responsibility and how to care for others.", chinese: "此外，照顾宠物教会我们责任感以及如何照顾他人。" },
        { english: "However, keeping pets also has its downsides.", chinese: "然而，养宠物也有其缺点。" },
        { english: "Pets can be noisy at night, which may disturb neighbors.", chinese: "宠物在晚上可能会很吵，这可能会打扰邻居。" },
        { english: "Some pets might even attack people.", chinese: "有些宠物甚至可能会攻击人。" },
        { english: "Besides, they need to be cleaned often, and their waste can cause environmental problems.", chinese: "此外，它们需要经常清洁，它们的排泄物可能会引起环境问题。" },
        { english: "The cost of food and medical care for pets can also be high.", chinese: "宠物的食物和医疗费用也可能很高。" },
        { english: "In my opinion, keeping pets is a good idea if we can take proper care of them.", chinese: "在我看来，如果我们能妥善照顾宠物，养宠物是个好主意。" },
        { english: "We should make sure they are clean, healthy, and well-trained.", chinese: "我们应该确保它们干净、健康且训练有素。" },
        { english: "By this way, pets can bring us joy without causing trouble to others.", chinese: "通过这种方式，宠物可以给我们带来快乐，而不会给他人带来麻烦。" }
    ]
};

export const ESSAY_2_PRE_DATA = {
    tokens: [
        t("Dear", "adj"), s(), t("Mr", "noun"), s(), t("and", "other"), s(), t("Mrs", "noun"), s(), t("Li", "noun"), t(",", "other", true), t("\n", "other", true),
        
        t("I", "other"), s(), t("hope", "verb"), s(), t("you", "other"), s(), t("are", "verb"), s(), t("doing", "verb"), s(), t("well", "adv"), t(".", "other", true), s(), t("I", "other"), t("'m", "verb"), s(), t("writing", "verb"), s(), t("to", "other"), s(), t("express", "verb"), s(), t("my", "other"), s(), t("thanks", "noun"), s(), t("to", "other"), s(), t("you", "other"), s(), t("for", "other"), s(), t("everything", "noun"), s(), t("you", "other"), s(), t("have", "verb"), s(), t("done", "verb"), s(), t("during", "other"), s(), t("my", "other"), s(), t("stay", "noun"), s(), t("in", "other"), s(), t("Shenzhen", "noun"), t(".", "other", true), t("\n", "other", true),
        
        t("It", "other"), s(), t("was", "verb"), s(), t("so", "adv"), s(), t("kind", "adj"), s(), t("of", "other"), s(), t("you", "other"), s(), t("to", "other"), s(), t("make", "verb"), s(), t("me", "other"), s(), t("feel", "verb"), s(), t("at", "other"), s(), t("home", "noun"), t(".", "other", true), s(), t("When", "other"), s(), t("I", "other"), s(), t("arrived", "verb"), s(), t("in", "other"), s(), t("Shenzhen", "noun"), t(",", "other", true), s(), t("everything", "noun"), s(), t("was", "verb"), s(), t("unfamiliar", "adj"), s(), t("to", "other"), s(), t("me", "other"), t(".", "other", true), s(), t("However", "adv"), t(",", "other", true), s(), t("you", "other"), s(), t("have", "verb"), s(), t("given", "verb"), s(), t("me", "other"), s(), t("a", "other"), s(), t("lot", "noun"), s(), t("of", "other"), s(), t("care", "noun"), s(), t("and", "other"), s(), t("taught", "verb"), s(), t("me", "other"), s(), t("some", "other"), s(), t("Chinese", "noun"), t(".", "other", true), s(), t("Thanks", "noun"), s(), t("to", "other"), s(), t("your", "other"), s(), t("help", "noun"), t(",", "other", true), s(), t("I", "other"), s(), t("have", "verb"), s(), t("adapted", "verb"), s(), t("to", "other"), s(), t("the", "other"), s(), t("digital", "adj"), s(), t("life", "noun"), s(), t("so", "adv"), s(), t("quickly", "adv"), t(",", "other", true), s(), t("from", "other"), s(), t("using", "verb"), s(), t("mobile", "adj"), s(), t("payment", "noun"), s(), t("to", "other"), s(), t("riding", "verb"), s(), t("shared", "adj"), s(), t("bikes", "noun"), t(".", "other", true), t("\n", "other", true),
        
        t("What's", "other"), s(), t("more", "adj"), t(",", "other", true), s(), t("it", "other"), s(), t("was", "verb"), s(), t("fantastic", "adj"), s(), t("to", "other"), s(), t("learn", "verb"), s(), t("about", "other"), s(), t("traditional", "adj"), s(), t("culture", "noun"), s(), t("with", "other"), s(), t("you", "other"), t(".", "other", true), s(), t("I", "other"), s(), t("especially", "adv"), s(), t("enjoyed", "verb"), s(), t("watching", "verb"), s(), t("the", "other"), s(), t("lion", "noun"), s(), t("dance", "noun"), s(), t("during", "other"), s(), t("the", "other"), s(), t("Spring", "noun"), s(), t("Festival", "noun"), t(".", "other", true), s(), t("Making", "verb"), s(), t("dumplings", "noun"), s(), t("together", "adv"), s(), t("has", "verb"), s(), t("become", "verb"), s(), t("another", "other"), s(), t("highlight", "noun"), s(), t("that", "other"), s(), t("helped", "verb"), s(), t("me", "other"), s(), t("understand", "verb"), s(), t("Chinese", "adj"), s(), t("traditions", "noun"), s(), t("better", "adv"), t(".", "other", true), t("\n", "other", true),
        
        t("Thank", "verb"), s(), t("you", "other"), s(), t("again", "adv"), s(), t("for", "other"), s(), t("your", "other"), s(), t("kindness", "noun"), s(), t("and", "other"), s(), t("support", "noun"), t("!", "other", true), s(), t("I", "other"), s(), t("do", "verb"), s(), t("hope", "verb"), s(), t("that", "other"), s(), t("we", "other"), s(), t("can", "verb"), s(), t("stay", "verb"), s(), t("in", "other"), s(), t("touch", "noun"), s(), t("all", "other"), s(), t("the", "other"), s(), t("time", "noun"), t(".", "other", true), s(), t("Welcome", "verb"), s(), t("to", "other"), s(), t("the", "other"), s(), t("UK", "noun"), s(), t("someday", "adv"), t("!", "other", true), t("\n", "other", true),
        
        t("Best", "adj"), s(), t("wishes", "noun"), t(",", "other", true), t("\n", "other", true),
        
        t("Peter", "noun")
    ],
    sentences: [
        { english: "Dear Mr and Mrs Li,", chinese: "亲爱的李先生和李太太，" },
        { english: "I hope you are doing well.", chinese: "希望你们一切安好。" },
        { english: "I'm writing to express my thanks to you for everything you have done during my stay in Shenzhen.", chinese: "我写这封信是为了感谢你们在我逗留深圳期间所做的一切。" },
        { english: "It was so kind of you to make me feel at home.", chinese: "你们让我感觉像在家里一样，真是太好了。" },
        { english: "When I arrived in Shenzhen, everything was unfamiliar to me.", chinese: "当我到达深圳时，一切对我来说都很陌生。" },
        { english: "However, you have given me a lot of care and taught me some Chinese.", chinese: "然而，你们给了我很多关照，还教了我一些中文。" },
        { english: "Thanks to your help, I have adapted to the digital life so quickly, from using mobile payment to riding shared bikes.", chinese: "多亏了你们的帮助，我很快适应了数字生活，从使用移动支付到骑共享单车。" },
        { english: "What's more, it was fantastic to learn about traditional culture with you.", chinese: "更重要的是，和你们一起学习传统文化真是太棒了。" },
        { english: "I especially enjoyed watching the lion dance during the Spring Festival.", chinese: "我特别喜欢春节期间看舞狮。" },
        { english: "Making dumplings together has become another highlight that helped me understand Chinese traditions better.", chinese: "一起包饺子成了另一个让我更好地了解中国传统的亮点。" },
        { english: "Thank you again for your kindness and support!", chinese: "再次感谢你们的善良和支持！" },
        { english: "I do hope that we can stay in touch all the time.", chinese: "我真的希望我们能一直保持联系。" },
        { english: "Welcome to the UK someday!", chinese: "欢迎某天来英国！" },
        { english: "Best wishes, Peter", chinese: "最美好的祝愿，彼得" }
    ]
};
