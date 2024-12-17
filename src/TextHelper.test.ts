import { describe, it, expect } from "vitest";
import { TextHelper } from "./TextHelper";

describe("TextHelper.splitToAlphabeticWords", () => {
    
    it("should split a string into alphabetic words", () => {
        const result = TextHelper.splitToAlphabeticWords("Hello World!");
        expect(result).toEqual(["Hello", "World"]);
    });

    it("should handle hashtags (#) and mentions (@) as valid word starters", () => {
        const result = TextHelper.splitToAlphabeticWords("Email me at @support or #help.");
        expect(result).toEqual(["Email", "me","at","@support","or","#help"]);
    });

    it("should ignore numbers and non-alphabetic characters", () => {
        const result = TextHelper.splitToAlphabeticWords("123 ABC! 456 DEF?");
        expect(result).toEqual(["ABC", "DEF"]);
    });

    it("should return an empty array for a string with no alphabetic characters", () => {
        const result = TextHelper.splitToAlphabeticWords("12345 !@#$%");
        expect(result).toEqual([]);
    });

    it("should handle an empty string input", () => {
        const result = TextHelper.splitToAlphabeticWords("");
        expect(result).toEqual([]);
    });

    it("should handle strings with mixed valid and invalid characters", () => {
        const result = TextHelper.splitToAlphabeticWords("Special @test #cases! 123 Done.");
        expect(result).toEqual(["Special", "@test", "#cases", "Done"]);
    });

    it("should consider single alphabetic characters as words", () => {
        const result = TextHelper.splitToAlphabeticWords("A quick test");
        expect(result).toEqual(["A", "quick", "test"]);
    });

    it("should handle strings with only hashtags or mentions", () => {
        const result = TextHelper.splitToAlphabeticWords("#tag @mention");
        expect(result).toEqual(["#tag", "@mention"]);
    });

    it("should not include standalone hashtags or mentions with no following word", () => {
        const result = TextHelper.splitToAlphabeticWords("### @@ @");
        expect(result).toEqual([]);
    });

    it("should handle mixed-case words", () => {
        const result = TextHelper.splitToAlphabeticWords("Hello hELLo HELLO");
        expect(result).toEqual(["Hello", "hELLo", "HELLO"]);
    });
});

describe("TextHelper.splitToAlphabeticWords - Extended Tests", () => {
    it("should handle words with Unicode characters", () => {
        const result = TextHelper.splitToAlphabeticWords("café résumé naïve jalapeño");
        expect(result).toEqual(["café", "résumé", "naïve", "jalapeño"]);
    });

    it("should handle hashtags and mentions with adjacent punctuation", () => {
        const result = TextHelper.splitToAlphabeticWords("Check #this! Also, try @that.");
        expect(result).toEqual(["Check", "#this", "Also", "try", "@that"]);
    });

    it("should include hashtags and mentions only if followed by alphabetic characters", () => {
        const result = TextHelper.splitToAlphabeticWords("Hello #123 @456 #ABC @DEF");
        expect(result).toEqual(["Hello", "#ABC", "@DEF"]);
    });

    it("should handle strings with a mix of valid and invalid hashtags and mentions", () => {
        const result = TextHelper.splitToAlphabeticWords("#valid @mention #123456 invalid@");
        expect(result).toEqual(["#valid", "@mention", "invalid"]);
    });

    it("should treat mixed alphabetic characters and punctuation correctly", () => {
        const result = TextHelper.splitToAlphabeticWords("End. Start? This-is_a:test!");
        expect(result).toEqual(["End", "Start", "This", "is", "a", "test"]);
    });

    it("should split words containing hyphens correctly", () => {
        const result = TextHelper.splitToAlphabeticWords("co-op re-enter pre-test");
        expect(result).toEqual(["co", "op", "re", "enter", "pre", "test"]);
    });

    it("should handle strings with consecutive hashtags and mentions", () => {
        const result = TextHelper.splitToAlphabeticWords("#first##second @@third @@@fourth");
        expect(result).toEqual(["#first", "#second", "@third", "@fourth"]);
    });

    it("should handle hashtags and mentions at the start or end of a string", () => {
        const result = TextHelper.splitToAlphabeticWords("#start middle @end");
        expect(result).toEqual(["#start", "middle", "@end"]);
    });

    it("should not include symbols or numbers inside words", () => {
        const result = TextHelper.splitToAlphabeticWords("word123 test!word 456word");
        expect(result).toEqual(["word", "test", "word", "word"]);
    });

    it("should handle long strings with multiple edge cases", () => {
        const result = TextHelper.splitToAlphabeticWords(
            "Start @mention-middle #hashTag123 456-word and ##end123!"
        );
        expect(result).toEqual(["Start", "@mention", "middle", "#hashTag", "word", "and", "#end"]);
    });

    it("should handle contractions correctly", () => {
        const result = TextHelper.splitToAlphabeticWords("He wasn't there because he couldn't've known.");
        expect(result).toEqual(["He", "wasn't", "there", "because", "he", "couldn't've", "known"]);
    });
    
    it("should handle words ending in 're correctly", () => {
        const result = TextHelper.splitToAlphabeticWords("We're going to the park.");
        expect(result).toEqual(["We're", "going", "to", "the", "park"]);
    });
    
    it("should handle words ending in 've correctly", () => {
        const result = TextHelper.splitToAlphabeticWords("They could've been better.");
        expect(result).toEqual(["They", "could've", "been", "better"]);
    });
    
    it("should handle a mix of contractions and regular words", () => {
        const result = TextHelper.splitToAlphabeticWords("You're not sure if it wasn't obvious.");
        expect(result).toEqual(["You're", "not", "sure", "if", "it", "wasn't", "obvious"]);
    });
    
});


describe("TextHelper.ExtractBlueskyHandles", () => {
    it("should extract valid Bluesky handles", () => {
        const text = "@jay.bluesky.app @stu.pocknee.com @dom.3com.net @havier.au";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual([
            "@jay.bluesky.app",
            "@stu.pocknee.com",
            "@dom.3com.net",
            "@havier.au",
        ]);
    });

    it("should ignore standalone '@' symbols", () => {
        const text = "@ @invalid @.com";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual([]);
    });

    it("should handle mixed valid and invalid handles", () => {
        const text = "Hello @jay.bluesky.app not-a-handle @invalid @good.handle.com!";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual(["@jay.bluesky.app", "@good.handle.com"]);
    });

    // it("should handle consecutive '@' symbols correctly", () => {
    //     const text = "@@jay.bluesky.app @@stu.pocknee.com";
    //     const result = TextHelper.ExtractBlueskyHandles(text);
    //     expect(result).toEqual(["@jay.bluesky.app", "@stu.pocknee.com"]);
    // });

    it("should handle trailing handles correctly", () => {
        const text = "Test handles: @jay.bluesky.app @stu.pocknee.com";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual(["@jay.bluesky.app", "@stu.pocknee.com"]);
    });

    it("should ignore invalid characters in handles", () => {
        const text = "@valid-handle.com @invalid!handle.com";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual(["@valid-handle.com"]);
    });

    it("should handle input with no handles", () => {
        const text = "There are no handles here.";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual([]);
    });

    it("should handle empty input", () => {
        const text = "";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual([]);
    });


    it("should handle email addresses", () => {
        const result = TextHelper.ExtractBlueskyHandles("hi@gmail.com bob@gmail.com");
        expect(result).toEqual([]);
    });
    // it("should ignore invalid handles starting with numbers or unsupported symbols", () => {
    //     const text = "@123.start.with.number @#symbol-start";
    //     const result = TextHelper.ExtractBlueskyHandles(text);
    //     expect(result).toEqual([]);
    // });

    it("should ignore standalone '@' symbols and prevent '.' or '-' immediately after '@'", () => {
        const text = "@ @invalid @.com @-user @valid.user";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual(["@valid.user"]);
    });
    
});


describe('ExtractHashtags', () => {
    it("should extract valid hashtags and ignore invalid ones", () => {
        const text = "Here are some hashtags: #Summer2024, #ElectionDay, #123, #$Invalid!, #Conference2024.";
        const result = TextHelper.ExtractHashtags(text);
        expect(result).toEqual(["#Summer2024", "#ElectionDay", "#Conference2024"]);
    });

    it("should ignore hashtags that start with or contain only numbers", () => {
        const text = "#123 #456yo #event2012";
        const result = TextHelper.ExtractHashtags(text);
        expect(result).toEqual(["#event2012"]);
    });

    it("should not include hashtags with special characters", () => {
        const text = "#!Summer #123!Election";
        const result = TextHelper.ExtractHashtags(text);
        expect(result).toEqual([]);
    });

    it("should extract hashtags without spaces between words", () => {
        const text = "Some hashtags: #USElection #SXSW2012 #BigData #TechEvent";
        const result = TextHelper.ExtractHashtags(text);
        expect(result).toEqual(["#USElection", "#SXSW2012", "#BigData", "#TechEvent"]);
    });

    it("should handle empty input", () => {
        const text = "";
        const result = TextHelper.ExtractHashtags(text);
        expect(result).toEqual([]);
    });

    it("should not include standalone '#' symbols", () => {
        const text = "# #.com";
        const result = TextHelper.ExtractHashtags(text);
        expect(result).toEqual([]);
    });

    it("should not include text where the '#' is followed by a non alphanumeric char", () => {
        const text = "#$ddd #-ddddd.cat #.com";
        const result = TextHelper.ExtractHashtags(text);
        expect(result).toEqual([]);
    });

    it("should handle hashtags with numbers but containing letters (not prefixed with numbers)", () => {
        const text = "#123Event #Conference2022 #Tech2024";
        const result = TextHelper.ExtractHashtags(text);
        expect(result).toEqual(["#Conference2022", "#Tech2024"]);
    });
});

describe('TextHelper.ExtractUrls', () => {
    it('should return an empty array when the input is empty', () => {
        const result = TextHelper.ExtractUrls('');
        expect(result).toEqual([]);
    });

    it('should return an empty array when the input has no URLs', () => {
        const result = TextHelper.ExtractUrls('This is a test string without URLs.');
        expect(result).toEqual([]);
    });

    it('should extract URLs starting with "http://"', () => {
        const text = 'Visit http://example.com for more information.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com']);
    });

    it('should extract URLs starting with "https://"', () => {
        const text = 'Secure site: https://secure-site.com';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['https://secure-site.com']);
    });

    it('should extract URLs starting with "www."', () => {
        const text = 'Check out www.example.com for great deals.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['www.example.com']);
    });

    it('should extract multiple unique URLs from the text', () => {
        const text = 'Visit http://example.com and also check https://secure-site.com or www.anotherexample.com.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual([
            'http://example.com',
            'https://secure-site.com',
            'www.anotherexample.com'
        ]);
    });

    it('should handle duplicate URLs by returning only unique entries', () => {
        const text = 'http://example.com is the same as http://example.com';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com']);
    });

    it('should handle text with URLs that have no sub domaims', () => {
        const text = 'Check http://example.com and www.example.com, and also example.com without www.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com', 'www.example.com', 'example.com']);
    });

    it('should ignore URLs that are cut off or malformed', () => {
        const text = 'Check http://example is not ok but the next is because it could be at the end of a sentence: www.example.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['www.example']);
    });
    it('should deal with trailing punctuation', () => {
        const text = 'Visit http://example.com/path.sss, or http://example.com/path.ttt.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(["http://example.com/path.sss", "http://example.com/path.ttt"]);
    });
    
    it('should exclude trailing punctuation if followed by whitespace', () => {
        const text = 'Visit http://example.com/path. Here is another link.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com/path']);
    });
    
    it('should exclude trailing punctuation if followed by a comma', () => {
        const text = 'Visit http://example.com/path, and then check www.site.com.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com/path', 'www.site.com']);
    });
    
    it('should handle markers', () => {
        const text = 'Visit http://example.com/path#somehwere, and then check www.site.com.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com/path#somehwere', 'www.site.com']);
    });
    
    it('should handle querystrings', () => {
        const text = 'Visit http://example.com/path/index.aspx?vsr=3 and then check www.site.com?vsr=3.';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com/path/index.aspx?vsr=3', 'www.site.com?vsr=3']);
    });

    
    // Test: Input string too short
    it('should return an empty array for a string that is too short', () => {
        const text = 'ab';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual([]); // Should return an empty array since the string is too short for any URL
    });

    // Test: Missing URL components (e.g., missing "://")
    it('should detect a string as a URL when missing "://"', () => {
        const text = 'www.example.com';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['www.example.com']); // Should not be detected as a valid URL without "http://" or "https://"
    });

    // Test: Invalid URL (just a partial domain without protocol)
    it('should not detect an incomplete URL with invalid domain format', () => {
        const text = 'Visit example at www,example,com today!';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual([]); // Invalid URL, contains commas
    });

    // Test: URLs with untrimmed special characters
    it('should detect a URL when it has untrimmed special characters at the end', () => {
        const text = 'Check this out: http://example.com/hello#world!';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com/hello#world!']); 
    });

    // Test: Non-URL strings
    it('should return an empty array for a string without any URLs', () => {
        const text = 'This is just a regular string without a URL!';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual([]); // No URLs in this text, so it should return an empty array
    });

    // Test: Multiple invalid URLs in a string
    it('should return an empty array for strings with multiple invalid URLs', () => {
        const text = 'Here are some URLs: xyz://invalid, http://, ftp://nope.com, xyz://nope.com';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual([]); // The "xyz://", "http://", and "ftp://" are not valid URLs, so no URLs are returned
    });

    // Test: Malformed URL with multiple "@" symbols
    it('should not detect a malformed URL with multiple "@" symbols', () => {
        const text = 'Visit this URL: http://example@com:8080 or this one: http://user@example.com:8080';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(["http://user@example.com:8080"]); // This should not be detected as a valid URL due to the misplaced "@" symbol
    });

    // Test: Valid URL followed by invalid content
    it('should return the correct URL even when invalid content follows', () => {
        const text = 'Check out this website: http://example.com/path/to/resource something else';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://example.com/path/to/resource']); // Should extract the URL but ignore the invalid content after
    });

    // Test: URLs with trailing spaces or characters
    it('should correctly trim trailing spaces and characters from URLs', () => {
        const text = 'The website is: https://example.com/ ';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['https://example.com']); // Should handle the space at the end of the URL correctly
    });

    // Test: URLs embedded in text with punctuation
    it('should detect a URL even when it is embedded in punctuation-heavy text', () => {
        const text = 'Contact us at: hello! @example.com, http://www.example.com';
        const result = TextHelper.ExtractUrls(text);
        expect(result).toEqual(['http://www.example.com']); // Should correctly detect the second URL, ignoring embedded punctuation
    });
    
});

describe('TextHelper.TrimChars', () => {
    it('should trim characters from both ends', () => {
      const input = "!!Hello World!!";
      const chars = ['!', ' '];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("Hello World");
    });
  
    it('should not modify the string if no characters are to be trimmed', () => {
      const input = "Hello World";
      const chars = ['!', ' '];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("Hello World");
    });
  
    it('should trim characters from the beginning', () => {
      const input = "   Hello World";
      const chars = [' '];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("Hello World");
    });
  
    it('should trim characters from the end', () => {
      const input = "Hello World   ";
      const chars = [' '];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("Hello World");
    });
  
    it('should handle trimming when the string consists entirely of characters to remove', () => {
      const input = "!#!#!!@#";
      const chars = ['!','/','#','@'];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("");
    });
  
    it('should handle trimming when the string consists of multiple chars at both ends', () => {
      const input = "!#!#sh!t!@#";
      const chars = ['!','/','#','@'];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("sh!t");
    });
  
    it('should return an empty string if the input is entirely made of characters to remove', () => {
      const input = "   ";
      const chars = [' '];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("");
    });
  
    it('should handle empty input string', () => {
      const input = "";
      const chars = [' ', '!'];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("");
    });
  
    it('should handle cases with no characters to trim', () => {
      const input = "Just a test!";
      const chars:string[] = [];
      const result = TextHelper.TrimChars(input, chars);
      expect(result).toBe("Just a test!");
    });
  });



