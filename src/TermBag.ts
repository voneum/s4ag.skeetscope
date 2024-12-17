// 

import { ITerm } from "./IBarChartBarConfig";

/**
 * A class to manage words and their counts, maintaining a sorted order.
 */
export class TermBag {
    // Backing store for words and counts, kept in descending order by count.
    private _termBag: ITerm[];
    // Map to track word-to-index mapping in the array.
    private _termIndexMap: Map<string, number>;

    private _filterTerms: Set<string>;
    private readonly _unsafe = ["fuck","cunt","shit", "faggot", "bitch", "cocksu", "slut", "wank", "twat", "blowjob", "arsehole", "asshole", "whore", "xxx"];
    
    constructor(filterTerms: Set<string>) {
        this._termBag = [];
        this._termIndexMap = new Map();
        this._filterTerms = filterTerms;
    }

    /**
     * Adds a word to the word bag, updating its count and maintaining order.
     * @param word - The word to add.
     */
    public AddTerm(word: string): void {
        if (this._termIndexMap.has(word)) {
            // Retrieve the index of the word in the backing array.
            const currentIndex = this._termIndexMap.get(word)!;
            // Increment the count of the word.
            this._termBag[currentIndex].count++;
    
            // Stepwise adjust the position in the array to maintain order.
            let newIndex = currentIndex;
            while (
                newIndex > 0 &&
                this._termBag[newIndex - 1].count < this._termBag[newIndex].count
            ) {
                // Swap the current element with the one before it.
                [this._termBag[newIndex - 1], this._termBag[newIndex]] = [
                    this._termBag[newIndex],
                    this._termBag[newIndex - 1],
                ];
    
                // Update indices in the map for both words.
                this._termIndexMap.set(this._termBag[newIndex - 1].word, newIndex - 1);
                this._termIndexMap.set(this._termBag[newIndex].word, newIndex);
    
                newIndex--;
            }
        } else {

            let isSafe = true;

            for (let j = 0; j < this._unsafe.length; j++) {
                const term = this._unsafe[j];
                if (word.indexOf(term) > -1){
                    isSafe = false;
                    break;
                }
            }
            const isNoise = this._filterTerms.has(word);
            if (isNoise && word[0] === "#" ){
                isSafe = false;
            }
            
            // Add a new word with a count of 1 at the end of the array.
            const newWord: ITerm = { word: word, count: 1, isSafe: isSafe, isNoise: isNoise };
            this._termBag.push(newWord);
            this._termIndexMap.set(word, this._termBag.length - 1);    
        }
    }
    

    /**
     * Retrieves the top `n` words with the highest counts in descending order.
     * @param n - The number of top words to retrieve.
     * @returns An array of objects containing the word and its count.
     */
    public GetTopTerms(n: number, noiseAllowed:boolean = false, safeOn:boolean = false ): ITerm[] {
        if (!noiseAllowed || safeOn){
            
            let count = 0;
            const result: ITerm[] = [];
            for (let i = 0; i < this._termBag.length; i++) {
                const element = this._termBag[i]; 

                if (safeOn && !element.isSafe){                    
                    //result.push(element)
                    continue;
                } else if (!safeOn && !element.isSafe) {
                    result.push(element)
                    count++;
                    if (count >= n){ 
                        break;
                    }
                    continue;
                }

                //can only arrive here if the word is safe, or if thre is no safe filter on

                const filtered = (!noiseAllowed && element.isNoise);
                if (!filtered) {
                    result.push(element)
                    count++;
                    if (count >= n){ 
                        break;
                    }
                }
            }

            return result;
        } else {
            return this._termBag.slice(0, n);
        }
        
    }

    /**
     * Returns the total number of distinct words in the word bag.
     * @returns The number of distinct words.
     */
    public GetDistinctWordCount(): number {
        return this._termBag.length;
    }
}
