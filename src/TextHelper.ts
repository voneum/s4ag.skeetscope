export class TextHelper {
    

    /**
     * Splits a string into individual words containing only alphabetic characters.
     * @param text - The input text to process.
     * @returns An array of words containing only alphabetic characters, hashtags, or mentions.
     */
    public static splitToAlphabeticWords2 = (text: string): string[] => {
        const words: string[] = [];
        let currentWord: string = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Check if character is alphabetic using Unicode regex
            if (/\p{L}/u.test(char)) {
                currentWord += char;
            } else if (
                (char === "#" || char === "@") &&
                currentWord.length === 0 &&
                i + 1 < text.length &&
                /\p{L}/u.test(text[i + 1])
            ) {
                currentWord += char;
            } else if (currentWord.length > 0) {
                words.push(currentWord);
                currentWord = "";
            }
        }

        if (currentWord.length > 0) {
            words.push(currentWord);
        }

        return words;
    };

    /**
     * Splits a string into individual words containing only alphabetic characters,
     * handling hashtags, mentions, and contractions such as "wasn't" or "could've."
     * @param text - The input text to process.
     * @returns An array of words containing only alphabetic characters, hashtags, mentions, and contractions.
     */
    public static splitToAlphabeticWords = (text: string): string[] => {
        const words: string[] = [];
        let currentWord: string = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // Match alphabetic characters or apostrophes in contractions
            if (/\p{L}/u.test(char) || (char === "'" && /\p{L}/u.test(text[i + 1]))) {
                currentWord += char;
            } else if (
                (char === "#" || char === "@") &&
                currentWord.length === 0 &&
                i + 1 < text.length &&
                /\p{L}/u.test(text[i + 1])
            ) {
                currentWord += char;
            } else if (currentWord.length > 0) {
                // Handle contractions ending patterns like n't, 've, 're
                if (
                    currentWord.endsWith("'") &&
                    (text[i] === "t" || text[i] === "v" || text[i] === "r") &&
                    (text[i + 1] === undefined || /\s|\p{P}/u.test(text[i + 1]))
                ) {
                    currentWord += text[i];
                } else {
                    words.push(currentWord);
                    currentWord = "";
                }
            }
        }

        // Add the last word if it exists
        if (currentWord.length > 0) {
            words.push(currentWord);
        }

        return words;
    };

    /**
     * Extracts Bluesky handles from the input text. NOTE: Will current return "@123.start.with.number" as a valid handle. Not sure about this...
     * @param text - The input text to process.
     * @returns An array of Bluesky handles found in the input text.
     */
    public static ExtractBlueskyHandles = (text: string): string[] => {
        const handles: string[] = [];
        let currentHandle: string = "";
        let isHandle = false;
    
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
    
            if (char === "@") {
                // Start a potential handle only if it's preceded by whitespace or the start of the string
                if (i === 0 || /\s/.test(text[i - 1])) {
                    if (isHandle && currentHandle.length > 1) {
                        handles.push(currentHandle);
                    }
                    isHandle = true;
                    currentHandle = char; // Start a new handle
                } else {
                    // Not a valid handle start
                    isHandle = false;
                    currentHandle = "";
                }
            } else if (isHandle) {
                if (currentHandle.length === 1 && (char === "." || char === "-")) {
                    // Invalid handle start, reset
                    isHandle = false;
                    currentHandle = "";
                    continue;
                }
    
                if (
                    (char >= "a" && char <= "z") ||
                    (char >= "A" && char <= "Z") ||
                    (char >= "0" && char <= "9") ||
                    char === "." ||
                    char === "-"
                ) {
                    currentHandle += char;
                } else {
                    // End of handle; validate before adding
                    if (
                        currentHandle.length > 1 &&
                        currentHandle.match(/[a-zA-Z0-9]/) &&
                        !currentHandle.endsWith(".") &&
                        !currentHandle.endsWith("-") &&
                        currentHandle.includes(".")
                    ) {
                        handles.push(currentHandle);
                    }
                    isHandle = false;
                    currentHandle = "";
                }
            }
        }
    
        // Add the last handle if valid
        if (
            currentHandle.length > 1 &&
            currentHandle.match(/[a-zA-Z0-9]/) &&
            !currentHandle.endsWith(".") &&
            !currentHandle.endsWith("-") &&
            currentHandle.includes(".")
        ) {
            handles.push(currentHandle);
        }
    
        return handles;
    };
    

    /**
     * Extracts hashtags from a given text string.
     * A valid hashtag must start with '#' and be followed by alphanumeric characters.
     * The hashtag cannot start or consist solely of numbers, and it must contain at least one letter.
     * Special characters are not allowed, and the hashtag cannot contain spaces.
     * Additionally, the hashtag cannot end with a period or hyphen, and must not start with or consist solely of special characters like '.' or '-'.
     * 
     * @param text - The input text from which hashtags are to be extracted.
     * @returns An array of valid hashtags found in the input text.
     */
    public static ExtractHashtags = (text: string): string[] => {
        const hashtags: string[] = [];
        let currentHashtag: string = "";
        let isHandle = false; // Track if a '#' has been seen.

        // Iterate through each character in the input text
        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            // If we encounter a '#', it's the start of a hashtag
            if (char === "#") {
                // Ensure the next character after '#' is an alphabetic letter
                if (i + 1 < text.length && !/[a-zA-Z]/.test(text[i + 1])) {
                    currentHashtag = ""; // Skip this invalid hashtag
                    isHandle = false;    // Reset handle tracking
                    continue;
                }

                // If a valid '#' is encountered, mark isHandle as true
                isHandle = true;
                currentHashtag = char; // Start a new hashtag with '#'
            } else if (/[a-zA-Z0-9]/.test(char) && isHandle) {
                // If it's an alphanumeric character and we've seen a valid '#', add it to the hashtag
                currentHashtag += char;
            } else {
                // If we encounter a non-alphanumeric character, finalize the current hashtag if valid
                if (currentHashtag.length > 1 && /[a-zA-Z]/.test(currentHashtag) &&
                    !currentHashtag.endsWith(".") && !currentHashtag.endsWith("-")) {
                    hashtags.push(currentHashtag);
                }
                currentHashtag = "";  // Reset for the next potential hashtag
                isHandle = false; // Reset handle tracking
            }
        }

        // Check if the last collected hashtag is valid
        if (currentHashtag.length > 1 && /[a-zA-Z]/.test(currentHashtag) &&
            !currentHashtag.endsWith(".") && !currentHashtag.endsWith("-")) {
            hashtags.push(currentHashtag);
        }

        return hashtags;
    };

    /**
     * Extracts all unique web URLs starting with "http://" or "https://" from a given text.
     * 
     * @param text - The input string of arbitrary length from which to extract URLs.
     * @returns An array of unique web URLs found in the input string. Returns an empty array if the input string is too short or no URLs are found.
     */
    public static ExtractUrlsWithRegex = (text: string): string[] => {
        // Return early if the input string is shorter than the shortest possible URL (7 characters for "http://").
        if (text.length < 7) {
            return [];
        }

        // Regular expression to match URLs starting with 'http://' or 'https://'.
        const urlRegex = /(https?:\/\/[^\s]+)/g;

        // Match all URLs in the input text using the regular expression.
        const matches = text.match(urlRegex);

        // If no URLs are found, return an empty array.
        if (!matches) {
            return [];
        }

        // Use a Set to ensure uniqueness of URLs.
        const uniqueUrls = new Set(matches);

        // Convert the Set to an array and return it.
        return Array.from(uniqueUrls);
    };

    
    /**
     * Extracts all unique web URLs from a given text.
     * 
     * @param text - The input string of arbitrary length from which to extract URLs.
     * @returns An array of unique web URLs found in the input string. Returns an empty array if the input string is too short or no URLs are found.
     */
    public static ExtractUrls = (text: string): string[] => {
        // Return early if the input string is shorter than the shortest possible URL.
        if (text.length < 4) {
            return [];
        }

        const matches:string[] = [];

        const lines = TextHelper.SplitOnLineBreaks(text);

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const terms = TextHelper.SplitOnWhitespaces(line);

            for (let j = 0; j < terms.length; j++) {
                const term = terms[j];
                if (term[0] !== "@"){ //can't start with @ or it might be a handle
                    const trimmedTerm = TextHelper.TrimChars(term, [".", ",", ":" , "/" , "?" , "#" , "[" , "]" , "@"]);
                    if (TextHelper.IsUrl(trimmedTerm)){
                        matches.push(trimmedTerm);
                    }
                }
            }
        }

        // Use a Set to ensure uniqueness of URLs.
        const uniqueUrls = new Set(matches);

        // Convert the Set to an array and return it.
        return Array.from(uniqueUrls);
    };

    public static IsUrl = (text: string): boolean => {
        if (text.length < 4) return false;
        if (text.indexOf(".") < 0) return false;
        
        const origLen = text.length;
        
        while (text.startsWith("http://") || text.startsWith("https://")){
            if (text.startsWith("http://")){
                text = text.slice(7);
            } else if (text.startsWith("https://")){
                text = text.slice(8);
            }
        }

        if (text.length < origLen){
            //don't want it to begin with any of these
            const trimmedTerm = TextHelper.TrimStartingChars(text, [".", ",", ":" , "/" , "?" , "#" , "[" , "]" , "@"]);
            if (text.length > trimmedTerm.length){
                return false;
            }
        }

        let first = TextHelper.SplitOnChars(text, [",", ":" , "/" , "?" , "#" , "[" , "]"])[0];    
        first = TextHelper.TrimChars(first, [".", "@"]);
        if (first.lastIndexOf("@") > -1){
            let firstArray = first.split("@");
            first = firstArray[firstArray.length-1]; //get last element (ie., the first after the last @ sign)            
        }
        first = TextHelper.TrimChars(first, ["."]);

        if (first.indexOf(".") > -1){
            let firstArray = first.split(".");
            if (firstArray[firstArray.length-1].length > 1 && firstArray[firstArray.length-2].length > 0){
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
   * Splits a string into an array of non-empty lines.
   * 
   * @param input - The input string to split.
   * @returns An array of non-empty lines.
   */
    public static SplitOnLineBreaks(input: string): string[] {
        // Split the string into lines and filter out empty ones.
        return input.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    }

    /**
     * Splits a string into an array of non-empty elements by whitespace.
     * 
     * @param input - The input string to split.
     * @returns An array of non-empty elements.
     */
    public static SplitOnWhitespaces(input: string): string[] {
        // Split the string on whitespace and filter out empty elements.
        return input.split(/\s+/).filter(element => element.length > 0);
    }

    /**
     * Splits a string into an array of substrings wherever any of the characters 
     * in the input array appear. Empty elements are removed from the result.
     * 
     * @param text - The input string to split.
     * @param input - An array of characters to split on.
     * @returns An array of non-empty substrings.
     */
    public static SplitOnChars(text: string, input: string[]): string[] {
        let result: string[] = [];
        let currentSubstring = '';

        // Iterate over each character in the text.
        for (let i = 0; i < text.length; i++) {
        const char = text[i];

        // If the character is in the input array, save the current substring and reset.
        if (input.includes(char)) {
            if (currentSubstring.length > 0) {
            result.push(currentSubstring);
            currentSubstring = '';
            }
        } else {
            // Otherwise, add the character to the current substring.
            currentSubstring += char;
        }
        }

        // If there's any remaining non-empty substring, add it to the result.
        if (currentSubstring.length > 0) {
        result.push(currentSubstring);
        }

        return result;
    }

    /**
     * Trims a string, removing any characters from the beginning or end
     * that are in the provided array of characters.
     * 
     * @param input - The input string to trim.
     * @param charsToRemove - An array of characters to remove from the start or end of the string.
     * @returns The trimmed string.
     */
    public static TrimChars(input: string, charsToRemove: string[]): string {
        // Trim from the start
        let start = 0;
        while (start < input.length && charsToRemove.includes(input[start])) {
            start++;
        }
    
        // Trim from the end
        let end = input.length - 1;
        while (end >= start && charsToRemove.includes(input[end])) {
            end--;
        }
    
        // Return the trimmed substring
        return input.slice(start, end + 1);
    }
    public static TrimStartingChars(input: string, charsToRemove: string[]): string {
        // Trim from the start
        let start = 0;
        while (start < input.length && charsToRemove.includes(input[start])) {
            start++;
        }
    
        // Return the trimmed substring
        return input.slice(start);
    }
      
      
      

}
