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

    it("should handle consecutive '@' symbols correctly", () => {
        const text = "@@jay.bluesky.app @@stu.pocknee.com";
        const result = TextHelper.ExtractBlueskyHandles(text);
        expect(result).toEqual(["@jay.bluesky.app", "@stu.pocknee.com"]);
    });

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


