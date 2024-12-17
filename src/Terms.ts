import { Base64Converter } from "./Base64Converter";

export class Terms{

   
    private static _adultTermsEncoded = "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";
    private static _adultTermsDecoded: string | null = null;
    public static AdultTerms = async (): Promise<string[]> => {
        if (Terms._adultTermsDecoded === null){
            Terms._adultTermsDecoded = await Base64Converter.FromBase64Async(this._adultTermsEncoded,false,true);
        }
        return Terms._adultTermsDecoded.split(" ");
    }

    public static NoiseTerms = (): string[] => {
        return ["act", "add", "age", "ago", "ain", "air", "all", "and", "any", "app", "are", "art", "ask", "ass", "bad", "bed", "big", "bit", "boy", "bro", "but", "buy", "can", "car", "cat", "com", "cry", "cut", "dad", "day", "did", "die", "dog", "due", "eat", "end", "etc", "eye", "fan", "far", "few", "for", "fun", "gay", "get", "god", "gop", "got", "guy", "had", "has", "her", "hey", "him", "his", "hit", "hot", "how", "isn", "its", "job", "kid", "law", "let", "lol", "lot", "low", "mad", "man", "may", "men", "mom", "new", "non", "not", "now", "off", "old", "one", "our", "out", "own", "pay", "per", "por", "put", "que", "rss", "run", "saw", "say", "see", "set", "sex", "she", "sky", "son", "the", "tho", "too", "top", "try", "two", "use", "via", "was", "way", "who", "why", "win", "won", "wow", "yes", "yet", "you", "able", "also", "aren", "away", "baby", "back", "been", "best", "blue", "book", "both", "call", "came", "card", "care", "case", "come", "cool", "cute", "dark", "days", "deal", "deep", "didn", "does", "done", "down", "each", "easy", "else", "even", "ever", "eyes", "face", "fact", "feel", "felt", "find", "fine", "fire", "food", "form", "free", "from", "full", "gets", "girl", "give", "glad", "goes", "gone", "good", "guys", "half", "hand", "hard", "hate", "have", "head", "hear", "hell", "here", "high", "hold", "home", "hope", "idea", "into", "join", "just", "keep", "kids", "kind", "knew", "know", "last", "late", "left", "less", "life", "like", "line", "link", "list", "live", "lmao", "long", "look", "lost", "lots", "love", "made", "maga", "make", "many", "mean", "mind", "mine", "miss", "more", "most", "much", "must", "name", "near", "need", "news", "next", "nice", "okay", "once", "ones", "only", "open", "over", "paid", "part", "past", "pick", "plus", "post", "read", "real", "rest", "safe", "said", "same", "save", "says", "seen", "self", "send", "sent", "sick", "side", "some", "song", "soon", "star", "stop", "such", "sure", "take", "talk", "team", "tell", "than", "that", "them", "then", "they", "this", "time", "told", "took", "true", "turn", "type", "used", "very", "wait", "want", "wasn", "ways", "week", "well", "went", "were", "what", "when", "will", "wish", "with", "word", "work", "yeah", "your", "about", "above", "added", "admit", "after", "again", "agree", "alive", "allow", "alone", "along", "among", "angry", "apple", "asked", "avoid", "awful", "based", "being", "below", "bills", "bitch", "blame", "block", "brain", "break", "bring", "broke", "brown", "build", "bunch", "calls", "cares", "catch", "cause", "check", "claim", "class", "clean", "clear", "click", "close", "color", "comes", "could", "count", "cover", "crazy", "cream", "daily", "doesn", "doing", "dream", "drink", "drive", "early", "email", "ended", "enjoy", "event", "every", "exist", "extra", "facts", "feels", "final", "first", "focus", "folks", "found", "fresh", "front", "fully", "funny", "given", "gives", "going", "gonna", "gotta", "grace", "great", "green", "group", "guess", "hands", "happy", "haven", "heard", "heart", "heavy", "hello", "helps", "hours", "ideas", "idiot", "image", "issue", "keeps", "kinda", "known", "knows", "large", "later", "learn", "least", "leave", "legal", "level", "light", "liked", "likes", "links", "lived", "lives", "local", "looks", "loved", "loves", "lucky", "makes", "maybe", "means", "meant", "might", "month", "names", "needs", "never", "night", "north", "often", "older", "order", "other", "party", "piece", "point", "posts", "price", "proud", "quite", "quote", "reach", "ready", "right", "round", "rules", "sadly", "saved", "seems", "sense", "shall", "shame", "share", "shirt", "short", "shows", "silly", "since", "sleep", "small", "smart", "solid", "songs", "sorry", "sound", "south", "speak", "spend", "spent", "stage", "stand", "start", "still", "stock", "story", "stuck", "stuff", "style", "sucks", "super", "taken", "takes", "taste", "terms", "thank", "thats", "their", "there", "these", "thing", "think", "third", "those", "three", "throw", "tired", "title", "total", "touch", "trans", "tried", "truly", "trust", "turns", "tweet", "under", "until", "using", "usual", "value", "vibes", "visit", "voice", "wanna", "wants", "watch", "weeks", "weird", "weren", "where", "which", "while", "whole", "whose", "women", "woods", "words", "works", "world", "worry", "worse", "worst", "worth", "would", "write", "wrong", "wrote", "years", "young", "yours", "always", "anyone", "around", "before", "better", "coming", "having", "little", "normal", "people", "person", "please", "really", "should", "things", "though", "trying", "already", "another", "because", "finally", "getting", "looking", "nothing", "shorter", "someone", "started", "thought", "through", "actually", "anything", "everyone", "favorite", "probably", "remember", "starting", "thinking", "together", "attention", "available", "basically", "beautiful", "currently", "different", "difficult", "excellent", "fantastic", "following", "important", "including", "literally", "otherwise", "perfectly", "seriously", "something", "sometimes", "wonderful", "absolutely", "activities", "additional", "apparently", "characters", "completely", "definitely", "discussion", "especially", "eventually", "everything", "experience", "interested", "particular", "personally", "supposedly", "themselves", "understand", "acknowledge", "application", "appreciated", "appropriate", "billionaire", "challenging", "comfortable", "competition", "competitive", "complaining", "complicated", "considering", "description", "desperately", "devastating", "development", "differently", "downloading", "effectively", "essentially", "experienced", "fascinating", "frustrating", "immediately", "importantly", "individuals", "information", "interaction", "interesting", "introducing", "necessarily", "opportunity", "participate", "performance", "personality", "possibility", "potentially", "practically", "progressive", "questioning", "remembering", "responsible", "significado", "significant", "technically", "threatening", "traditional", "accidentally", "aggressively", "consequences", "consistently", "contributing", "conversation", "disappointed", "experiencing", "explanations", "institutions", "occasionally", "particularly", "presidential", "professional", "relationship", "specifically", "controversial", "conversations", "organizations", "relationships", "significantly", "uncomfortable", "understanding", "unfortunately", "responsibility", "simultaneously", "understandable", "don't","doesn't","wasn't", "could've", "should've", "would've", "couldn't", "shouldn't", "would'nt", "can't", "won't", "we're", "it's", "i'm", "i'll","i'd","i've","let's", "he's", "she's", "that's", "they're", "there's", "here's", "where's", "didn't", "you're"];
    }

    public static AdultHashtagsByLength = async (len: number): Promise<Set<string>> => {
        const filtered = (await Terms.AdultTerms()).filter((t:string) => {
            return t.length === len;
        });

        return new Set<string>(filtered.map((f) => { return "#" + f; }));
    }

    public static AdultHashtagsByLengthGreaterThan = async (len: number): Promise<Set<string>> => {
        const filtered = (await Terms.AdultTerms()).filter((t:string) => {
            return t.length > len;
        });
        return new Set<string>(filtered.map((f) => { return "#" + f; }));
    }

    
    public static TermsByLength = (terms: string[], len: number): Set<string> => {
        const filtered = terms.filter((t:string) => {
            return t.length === len;
        });

        return new Set<string>(filtered);
    }
    public static TermsByLengthGreaterThan = (terms: string[], len: number): Set<string> => {
        const filtered = terms.filter((t:string) => {
            return t.length > len;
        });

        return new Set<string>(filtered);
    }

    
}