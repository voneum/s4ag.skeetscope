// 
/**
 * A class to manage words and their counts, maintaining a sorted order.
 */
export class WordBag {
    // Backing store for words and counts, kept in descending order by count.
    private _wordBag: { word: string; count: number }[];
    // Map to track word-to-index mapping in the array.
    private _wordIndexMap: Map<string, number>;

    constructor() {
        this._wordBag = [];
        this._wordIndexMap = new Map();
    }

    /**
     * Adds a word to the word bag, updating its count and maintaining order.
     * @param word - The word to add.
     */
    public AddWord(word: string): void {
        if (this._wordIndexMap.has(word)) {
            // Retrieve the index of the word in the backing array.
            const currentIndex = this._wordIndexMap.get(word)!;
            // Increment the count of the word.
            this._wordBag[currentIndex].count++;
    
            // Stepwise adjust the position in the array to maintain order.
            let newIndex = currentIndex;
            while (
                newIndex > 0 &&
                this._wordBag[newIndex - 1].count < this._wordBag[newIndex].count
            ) {
                // Swap the current element with the one before it.
                [this._wordBag[newIndex - 1], this._wordBag[newIndex]] = [
                    this._wordBag[newIndex],
                    this._wordBag[newIndex - 1],
                ];
    
                // Update indices in the map for both words.
                this._wordIndexMap.set(this._wordBag[newIndex - 1].word, newIndex - 1);
                this._wordIndexMap.set(this._wordBag[newIndex].word, newIndex);
    
                newIndex--;
            }
        } else {
            // Add a new word with a count of 1 at the end of the array.
            const newWord = { word, count: 1 };
            this._wordBag.push(newWord);
            this._wordIndexMap.set(word, this._wordBag.length - 1);    
        }
    }
    

    /**
     * Retrieves the top `n` words with the highest counts in descending order.
     * @param n - The number of top words to retrieve.
     * @returns An array of objects containing the word and its count.
     */
    public GetTopWords(n: number): { word: string; count: number }[] {
        return this._wordBag.slice(0, n);
    }

    /**
     * Returns the total number of distinct words in the word bag.
     * @returns The number of distinct words.
     */
    public GetDistinctWordCount(): number {
        return this._wordBag.length;
    }
}
