/**
 * Configuration for a bar in the bar chart.
 */
export interface IBarChartBarConfig {
    /**
     * The HTML canvas element where the bar will be drawn.
     */
    canvas: HTMLCanvasElement;

    /**
     * The label or word associated with this bar.
     */
    word: string;

    /**
     * The value this bar represents.
     * Should be between `minCount` and `maxCount`.
     */
    count: number;

    /**
     * The minimum value across all bars currently displayed in the chart.
     */
    minCount: number;

    /**
     * The maximum value across all bars currently displayed in the chart.
     */
    maxCount: number;

    /**
     * The rank of this bar within the chart.  1-based.
     */
    rank: number;

    /**
     * The color of the bar, specified as a CSS color string (e.g., "red", "#FF0000").
     */
    color: string;

    /**
     * The maximum number of bars that can be displayed in the chart.
     */
    maxBarCount: number;

    /**
     * Padding around the chart in pixels.
     * Must be non-negative.
     */
    padding: number;

    /**
     * The width in pixels reserved for the label gutter (space for labels).
     */
    labelGutterWidth: number;
}
