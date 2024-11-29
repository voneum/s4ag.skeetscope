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
                // Start a potential handle
                if (!isHandle) {
                    isHandle = true;
                    currentHandle = char; // Include the '@' in the handle
                } else {
                    // Already inside a handle; reset if another '@' is encountered
                    if (currentHandle.length > 1) {
                        handles.push(currentHandle);
                    }
                    currentHandle = "@";
                }
            } else if (isHandle) {

                // Do not allow a dot or hyphen immediately after '@'
                if (currentHandle.length === 1 && (char === "." || char === "-")) {
                    isHandle = false;  // Invalid handle; reset
                    currentHandle = "";
                    continue;
                }
                
                // Validate characters for domain names
                if (
                    (char >= "a" && char <= "z") || // Lowercase letters
                    (char >= "A" && char <= "Z") || // Uppercase letters
                    (char >= "0" && char <= "9") || // Numbers
                    char === "." ||                 // Dot for domains
                    char === "-"                    // Hyphen in domain names
                ) {
                    currentHandle += char;
                } else {
                    // End of a handle; validate before adding
                    if (
                        currentHandle.length > 1 &&
                        currentHandle.match(/[a-zA-Z0-9]/) &&
                        !currentHandle.endsWith(".") &&
                        !currentHandle.endsWith("-") &&
                        currentHandle.includes(".") // Ensure at least one period is present
                    ) {
                        handles.push(currentHandle);
                    }
                    isHandle = false;
                    currentHandle = "";
                }
            }
        }
    
        // Add the last handle if it exists and is valid
        if (
            currentHandle.length > 1 &&
            currentHandle.match(/[a-zA-Z0-9]/) &&
            !currentHandle.endsWith(".") &&
            !currentHandle.endsWith("-") &&
            currentHandle.includes(".") // Ensure at least one period is present
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



    
}
