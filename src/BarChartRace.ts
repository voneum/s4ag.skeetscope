import { BarChartBar } from "./BarChartBar";
import { IBarChartBarConfig } from "./IBarChartBarConfig";

/**
 * BarChartRace class creates and manages an animated bar chart race.
 * The chart displays words and their counts in an animated bar chart, where the bars race in rank order.
 */
export class BarChartRace {
    private _container: HTMLElement; // The container element for the bar chart
    private _canvas: HTMLCanvasElement; // The canvas element used for drawing the chart
    private _ctx: CanvasRenderingContext2D; // The 2D drawing context for the canvas
    private _activeBars: BarChartBar[] = []; // Array of active bars in the chart
    private _name: string = "";
    private _pointerLocation: number[] | null = null;
    private _pointerTerm: string = "";

    private _wordColors: Map<string, string> = new Map(); // Maps words to their assigned colors
    //private _maxCount: number = 0; // Maximum count for the words (used to scale bars)
    private _currentMaxWordCount = 0; // Current maximum word count in the animation

    private _startTime: number = 0; // The timestamp when the animation starts
    private _animationFrameId: number | null = null; // The ID for the animation frame request
    public static BAR_COUNT: number = 10; // The maximum number of bars to display
    private static DEFAULT_PADDING = 5; // Padding around each bar
    private static DEFAULT_LABEL_GUTTER = 50; // Padding between the bar and label
    private static DEFAULT_ANIMATION_DURATION = 1500; // Duration for each animation cycle in milliseconds



    private _resizeObserver = new ResizeObserver((entries) => {
        this.updateCanvasSize();
    });

    /**
     * Creates a new BarChartRace instance.
     * @param container The HTML container element to hold the chart
     */
    constructor(name: string, container: HTMLElement) {
        this._name = name;
        this._container = container;

        // Create the canvas element and append it to the container
        this._canvas = document.createElement("canvas");
        if (this._canvas)
        this._container.appendChild(this._canvas);
        this._ctx = this._canvas.getContext("2d")!;

        // Set the initial size of the canvas
        this.updateCanvasSize();
        
        this._resizeObserver.observe(this._container);


        this._canvas.addEventListener("pointerover", (ev:PointerEvent) => {
            this._canvas.style.cursor = "pointer";
            this._pointerLocation = this._getPointerCoords(ev);
            this._pointerTerm = this._getPointerWord(this._pointerLocation);
        }, false);
        this._canvas.addEventListener("pointermove", (ev:PointerEvent) => {
            this._canvas.style.cursor = "pointer";
            this._pointerLocation = this._getPointerCoords(ev);
            this._getPointerWord(this._pointerLocation);
            this._pointerTerm = this._getPointerWord(this._pointerLocation);
            
        }, false);
        this._canvas.addEventListener("pointerout", (ev:PointerEvent) => {
            this._canvas.style.cursor = "unset";
            this._pointerLocation = null;
            this._pointerTerm = "";
        }, false);
        this._canvas.addEventListener("pointerdown", (ev:PointerEvent) => {
            // this._pointerLocation = this._getPointerCoords(ev);
            // this._pointerTerm = this._getPointerWord(this._pointerLocation);
            
            if (this._pointerTerm.length > 0) {
                if (this._pointerTerm[0] === "#" && this._pointerTerm.length > 1){
                    const hashTag = this._pointerTerm.slice(1);
                    window.open(`https://bsky.app/hashtag/${hashTag}`, '_blank')?.focus();
                } else if (this._pointerTerm[0] === "@" && this._pointerTerm.length > 1){
                    const user = this._pointerTerm.slice(1);
                    window.open(`https://bsky.app/profile/${user}`, '_blank')?.focus();
                } else {
                    window.open(`https://bsky.app/search?q=${this._pointerTerm}`, '_blank')?.focus();
                }
            };
        });
    }

    private _getPointerCoords = (ev:PointerEvent): number[] => {
        const rect = this._canvas.getBoundingClientRect();
        return [ev.clientX - rect.left, ev.clientY - rect.top];
    }
    private _getPointerWord = (pointerLocation: number[] | null): string => {

        if (pointerLocation){
            const index = Math.max(0,Math.floor(BarChartRace.BAR_COUNT * (pointerLocation[1]) / (30 * BarChartRace.BAR_COUNT))) + 1;
                //console.log(index, this._activeBars.length);
            const barIndex = this._activeBars.findIndex((b)=>{ 
                return b.Rank === index;
            });
            const activeBar = this._activeBars[barIndex];
            if (activeBar) {           
                //console.log(index, activeBar.Word);
                return activeBar.Word;
            } else {
                return "";
            }
        } else {
            return "";
        }
    }


    /**
     * Gets the chart name.
     */
    public get Name() {
        return this._name;
    }

    /**
     * Gets whether the chart is currently animating.
     */
    public get IsAnimating() {
        return this._animationFrameId !== null;
    }

    /**
     * Retrieves the color for a specific word. Generates a random color if it doesn't exist.
     * @param word The word to get the color for
     * @returns The color as a string in hsl format
     */
    private getColorForWord(word: string): string {
        if (!this._wordColors.has(word)) {
            // Generate a random color for each word
            const color = `hsl(${Math.random() * 360}, 70%, 60%)`;
            this._wordColors.set(word, color);
        }
        return this._wordColors.get(word)!;
    }

    /**
     * Updates the canvas size based on the container's size.
     */
    private updateCanvasSize() {
        this._canvas.width = this._container.clientWidth;
        this._canvas.height = this._container.clientHeight;
    }

    /**
     * Resets chart race.
     */
    public Clear() {

        // Stop the animation if it is already running
        if (this.IsAnimating) {
            this.StopAnimation();
        }

        // Clear the canvas to remove any visual content
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // Destroy each active bar
        this._activeBars.forEach(bar => bar.Destroy());
        this._activeBars.length = 0;

        // Clear the word colors map
        this._wordColors.clear();
    }

    
    /**
     * Updates the words and their counts displayed on the chart, and restarts the animation if necessary.
     * @param words An array of objects containing words and their corresponding counts
     */
    public UpdateWords(words: { word: string, count: number }[]) {
        // Stop the animation if it is already running
        if (this.IsAnimating) {
            this.StopAnimation();
        }

        // Sync the active bars with the new data
        this._syncActiveBars(words);

        // Start the animation loop
        this._startTime = performance.now();
        this.animate();
    }

    /**
     * Starts the animation loop.
     */
    private animate() {
        const elapsedTime = performance.now() - this._startTime;

        // Calculate the progress of the animation based on elapsed time
        const progress = Math.min(elapsedTime / BarChartRace.DEFAULT_ANIMATION_DURATION, 1);

        // Redraw the canvas for each frame
        this.draw(progress);

        // If the animation is not complete, keep requesting the next frame
        if (progress < 1) {
            this._animationFrameId = requestAnimationFrame(this.animate.bind(this));
        } else {
            this.StopAnimation();
        }
    }

    /**
     * Draws the current frame of the animation.
     * @param progress The progress of the animation, ranging from 0 to 1
     */
    private draw(progress: number) {
        // Clear the canvas
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // Update and render each active bar
        this._activeBars.forEach((entry, index) => {
            entry.UpdateRender(progress, this._currentMaxWordCount);
        });

        this._drawTooltip();
        
    }
    private _drawTooltip(){
        if (this._pointerLocation){

            const loc = this._pointerLocation;
            // // Start a new Path
            // this._ctx.beginPath();
            // this._ctx.moveTo(0, loc[1]);
            // this._ctx.lineTo(this._canvas.width, loc[1]);

            // // Draw the Path
            // this._ctx.lineWidth = 2;
            // this._ctx.strokeStyle = "red";

            // this._ctx.stroke();

            if (this._pointerTerm.length > 0){
                this._ctx.save();

                this._ctx.shadowColor = "white";
                this._ctx.shadowOffsetX = 1;
                this._ctx.shadowOffsetY = 1;


                this._ctx.font = "bold 16px Arial";
                this._ctx.fillText(this._pointerTerm,loc[0] + 5,loc[1] - 5);
                
                this._ctx.restore(); 
            }
        }
    }

    /**
     * Stops the animation and resets the animation frame ID.
     */
    public StopAnimation() {
        if (this._animationFrameId !== null) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;

            // Remove any excess bars that exceed the maximum bar count
            this._activeBars = this._activeBars.filter(bar => bar.Rank <= BarChartRace.BAR_COUNT);
        }
    }

    /**
     * Syncs the current word counts with the active bars. Creates or updates bars as necessary.
     * @param words An array of objects containing words and their corresponding counts
     */
    private _syncActiveBars(words: { word: string; count: number }[]) {
        const maxLetterCount = words.reduce((max, item) => Math.max(max, item.word.length), -Infinity);

        this._currentMaxWordCount = 0;
        let currentMinWordCount = words.length > 0 ? Number.MAX_VALUE : 0;

        // Calculate the current maximum and minimum word counts
        for (let i = 0; i < words.length; i++) {
            this._currentMaxWordCount = Math.max(this._currentMaxWordCount, words[i].count);
            currentMinWordCount = Math.min(currentMinWordCount, words[i].count);
        }

        // Iterate through the words and either update existing bars or create new ones
        for (let i = 0; i < words.length; i++) {
            const currentWord = words[i].word;
            const currentCount = words[i].count;
            const index = this._activeBars.findIndex((r) => { return r.Word === currentWord; });

            if (index > -1) {
                // Update existing bar
                this._activeBars[index].SetTargetState(currentCount, i + 1, this._currentMaxWordCount);
                //setting the gutter width again is important when you are looing at word ranges that have more than one set char length
                this._activeBars[index].LabelGutterWidth = BarChartRace.DEFAULT_LABEL_GUTTER + maxLetterCount * 5;

            } else {
                // Create a new bar
                const config: IBarChartBarConfig = {
                    canvas: this._canvas,
                    word: currentWord,
                    count: currentCount,
                    rank: i + 1,
                    minCount: currentMinWordCount,
                    maxCount: this._currentMaxWordCount,
                    color: this.getColorForWord(currentWord),
                    maxBarCount: BarChartRace.BAR_COUNT,
                    padding: BarChartRace.DEFAULT_PADDING,
                    labelGutterWidth: BarChartRace.DEFAULT_LABEL_GUTTER + maxLetterCount * 5,
                };

                this._activeBars.push(new BarChartBar(config));
            }
        }

        // Remove any excess bars that are no longer in the words list
        if (this._activeBars.length > BarChartRace.BAR_COUNT) {
            for (let i = 0; i < this._activeBars.length; i++) {
                const currentWord = this._activeBars[i].Word;
                const index = words.findIndex((r) => { return r.word === currentWord; });
                if (index === -1) {
                    this._activeBars[i].SetTargetState(this._activeBars[i].Count, BarChartRace.BAR_COUNT + 2, this._currentMaxWordCount);
                }
            }
        }
    }

    /**
     * Cleans up and destroys the BarChartRace instance.
     * Stops any ongoing animations, removes event listeners, clears the canvas, and resets all properties.
     */
    public Destroy() {

        //halt resize observation
        this._resizeObserver.unobserve(this._container);

        // Stop any ongoing animation
        if (this._animationFrameId !== null) {
            cancelAnimationFrame(this._animationFrameId);
            this._animationFrameId = null;
        }

        // Remove the resize event listener
        window.removeEventListener("resize", this.updateCanvasSize);

        // Clear the canvas to remove any visual content
        this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

        // Destroy each active bar
        this._activeBars.forEach(bar => bar.Destroy());
        this._activeBars = [];

        // Optionally, remove the canvas from the DOM if it's no longer needed
        if (this._container.contains(this._canvas)) {
            this._container.removeChild(this._canvas);
        }

        // Clear the word colors map
        this._wordColors.clear();
    }
}
