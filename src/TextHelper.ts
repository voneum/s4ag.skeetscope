export class TextHelper {
    /**
     * Splits a string into individual words containing only alphabetic characters.
     * @param text - The input text to process.
     * @returns An array of words containing only alphabetic characters.
     */
    public static splitToAlphabeticWords = (text: string): string[] => {
        const words: string[] = [];
        let currentWord: string = "";

        for (let i = 0; i < text.length; i++) {
            const char = text[i];

            if ((char >= "A" && char <= "Z") || (char >= "a" && char <= "z")) {
                // Append alphabetic characters to the current word
                currentWord += char;
            } else if (
                (char === "#" || char === "@") &&
                currentWord.length === 0 &&
                i + 1 < text.length && 
                ((text[i + 1] >= "A" && text[i + 1] <= "Z") || (text[i + 1] >= "a" && text[i + 1] <= "z"))
            ) {
                // Start a new word with # or @ if followed by alphabetic characters
                currentWord += char;
            } else if (currentWord.length > 0) {
                // Push the completed word and reset
                words.push(currentWord);
                currentWord = "";
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
    public static ExtractUrls = (text: string): string[] => {
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

    
}
