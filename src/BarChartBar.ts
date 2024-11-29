import { IBarChartBarConfig } from "./IBarChartBarConfig";

/**
 * Represents a single bar in a bar chart. Handles rendering, transitioning, and label drawing.
 */
export class BarChartBar {
    
    // Canvas element where the bar chart will be drawn.
    private _canvas: HTMLCanvasElement;
    // Maximum number of bars allowed in the chart.
    private _maxBarCount: number;
    // Word associated with the bar (label).
    private _word: string;
    // Previous count value for smooth transitions.
    private _lastCount: number = 0;
    // Previous displayed count value for proportional resizing during transitions.
    private _lastDisplayCount: number = 0;
    // Previous maximum count value in the chart.
    private _lastMaxCount!: number;
    // Target count value for this bar.
    private _targetCount: number;
    // Previous rank position of the bar.
    private _lastRank: number = 0;
    // Target rank position of the bar.
    private _targetRank: number;
    // Color of the bar.
    private _color: string;
    // Padding around the bar chart.
    private _padding: number;
    // Width reserved for labels next to the bars.
    private _labelGutterWidth: number;

    // Static configurations for text rendering.
    private static FONT = "14px Arial"; // Font style and size for labels.
    private static TEXT_COLOR = "#000"; // Text color for labels.
    private static BAR_HEIGHT_PROPORTION = 0.9; // Proportion of the bar slot height used for the bar height.
    private static BAR_INSIDE_THRESHOLD = 0.5; // Threshold to determine if the count label should be inside the bar.

    /**
     * Constructs a new BarChartBar.
     * 
     * @param config - Configuration object for the bar, implementing the IBarChartBarConfig interface.
     * @throws Will throw an error if the canvas is not provided or padding is negative.
     */
    constructor(config: IBarChartBarConfig) {
        if (!config.canvas) throw new Error("Canvas is required");
        if (config.padding < 0) throw new Error("Padding must be non-negative");

        this._canvas = config.canvas;
        this._word = config.word;
        this._targetCount = config.count;
        this._targetRank = config.rank;
        this._lastRank = config.maxBarCount + 2; // Start rank outside visible range.
        this._color = config.color;
        this._maxBarCount = config.maxBarCount;
        this._padding = config.padding;
        this._labelGutterWidth = this._trimGutterWidth(config.labelGutterWidth);
        this._lastMaxCount = config.maxCount;
        this._lastCount = config.minCount;
        this._lastDisplayCount = config.minCount;
    }

    private _trimGutterWidth(val:number){
        return Math.min(val,120);
    }

    /**
     * Gets the word label associated with this bar.
     */
    public get Word() {
        return this._word;
    }

    /**
     * Gets the target count value for this bar.
     */
    public get Count() {
        return this._targetCount;
    }

    /**
     * Gets the target rank of this bar.
     */
    public get Rank() {
        return this._targetRank;
    }
    
    /**
     * Sets the width reserved for labels next to the bars..
     */
    public set LabelGutterWidth(val: number){
        this._labelGutterWidth = this._trimGutterWidth(val);
    }

    /**
     * Updates the target state of the bar, including count, rank, and the new maximum count.
     * 
     * @param count - The new target count for this bar.
     * @param rank - The new target rank for this bar.
     * @param newMaxCount - The new maximum count value for the chart.
     */
    public SetTargetState(count: number, rank: number, newMaxCount: number) {
        this._lastDisplayCount = this._targetCount / this._lastMaxCount * newMaxCount;
        this._lastCount = this._targetCount;
        this._lastRank = this._targetRank;
        this._targetCount = count;
        this._targetRank = rank;
    }

    /**
     * Renders the bar with a smooth transition between states based on the provided proportion.
     * 
     * @param transitionProportion - A value between 0 and 1 indicating the progress of the transition.
     * @param maxCount - The maximum count value for the chart (used for scaling).
     * @throws Will throw an error if transitionProportion is outside the range [0, 1].
     */
    public UpdateRender(transitionProportion: number, maxCount: number) {
        if (transitionProportion < 0 || transitionProportion > 1) {
            const err = `Invalid transition proportion ${transitionProportion}`;
            console.error(err);
            throw new Error(err);            
        }

        this._lastMaxCount = maxCount;

        const ctx = this._canvas.getContext('2d');
        if (!ctx) throw new Error("Failed to get 2D context from canvas");

        const width = this._canvas.width;
        const height = this._canvas.height;

        // Calculate dimensions and positions for the bar.
        const maxBarWidth = width - 2 * this._padding - this._labelGutterWidth;
        const barSlotHeight = (height - 2 * this._padding) / this._maxBarCount;
        const barHeight = barSlotHeight * BarChartBar.BAR_HEIGHT_PROPORTION;
        const transitionCount = this._lastCount + transitionProportion * (this._targetCount - this._lastCount);
        const barWidth = (this._lastDisplayCount + transitionProportion * (this._targetCount - this._lastDisplayCount)) / maxCount * maxBarWidth;
        const transitionRank = this._lastRank + transitionProportion * (this._targetRank - this._lastRank);
        const barCenterHeight = this._padding + transitionRank * barSlotHeight - barSlotHeight / 2;

        // Draw the bar.
        const barGradient = ctx.createLinearGradient(0, barCenterHeight - barHeight / 2, 0, barCenterHeight + barHeight / 2);
        barGradient.addColorStop(0, 'white');
        barGradient.addColorStop(0.15, this._color);
        barGradient.addColorStop(0.85, this._color);
        barGradient.addColorStop(1, 'black');
    
        ctx.fillStyle = barGradient;
        ctx.beginPath();
        ctx.roundRect(this._padding + this._labelGutterWidth, barCenterHeight - barHeight / 2, barWidth, barHeight,3);
        ctx.fill();

        // Draw the word label.
        this._drawText(ctx, this._word, this._padding + this._labelGutterWidth - 5, barCenterHeight, "right");
    
        // Draw the count label, positioned inside or outside the bar based on its width.
        const inside = barWidth / width > BarChartBar.BAR_INSIDE_THRESHOLD;
        const align = inside ? "right" : "left";
        const xPos = inside
            ? this._padding + this._labelGutterWidth + barWidth - 5
            : this._padding + this._labelGutterWidth + barWidth + 5;
        this._drawText(ctx, Math.round(transitionCount).toString(), xPos, barCenterHeight, align);
    }

    /**
     * Draws text on the canvas.
     * 
     * @param ctx - The 2D rendering context of the canvas.
     * @param text - The text to draw.
     * @param x - The x-coordinate of the text position.
     * @param y - The y-coordinate of the text position.
     * @param align - The text alignment ("left", "right", "center").
     */
    private _drawText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, align: CanvasTextAlign) {

        let url = "";
        let pixLower = 0;

        if (text.startsWith("@")){
            const dot = text.indexOf(".");
            url = text.substring(dot+1);
            text = text.substring(0,dot);
            pixLower = -3;
        }

        if (text.length > 17){
            text = text.substring(0,14) + "...";
        }

        ctx.font = BarChartBar.FONT;
        ctx.textAlign = align;
        ctx.textBaseline = url.length === 0 ? "middle" : "bottom";
        ctx.fillStyle = BarChartBar.TEXT_COLOR;
        ctx.fillText(text, x, y - pixLower);

        if (url.length > 0){
            ctx.font = "11px arial"
            ctx.textBaseline ="top";
            ctx.fillStyle = "blue";
            ctx.fillText(url, x, y - pixLower);
        }

    }


    public Destroy() {

    }
}
