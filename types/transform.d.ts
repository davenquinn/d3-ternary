/**
 * Computes the domain ranges for each axis given a transform object from d3.zoom.
 * The transform object contains scale (k) and translation (x,y) values.
 *
 * This function ensures the domains stay within valid bounds and maintains
 * equal domain lengths across all axes.
 *
 * @param transform - Object containing zoom transform parameters:
 *   - k: scale factor (zoom level)
 *   - x: x-translation
 *   - y: y-translation
 * @returns Tuple of three [start,end] domain ranges for axes A, B, and C
 * @throws Error if zoom level or translation would create invalid domains
 */
export declare function domainsFromTransform(transform: {
    k: number;
    x: number;
    y: number;
}): [[number, number], [number, number], [number, number]];
/**
 * Computes the d3.zoom transform parameters that would create the given domain ranges.
 * This is the inverse of domainsFromTransform().
 *
 * Used to sync the zoom and pan state to match specified domain ranges.
 * The returned transform can be passed to d3.zoom.transform() to update the view.
 *
 * @param domains - Array of [start,end] domain ranges for axes A, B, and C
 * @returns Object with zoom transform parameters:
 *   - k: scale factor (zoom level)
 *   - x: x-translation (unscaled by radius)
 *   - y: y-translation (unscaled by radius)
 */
export declare function transformFromDomains(domains: [[number, number], [number, number], [number, number]]): {
    k: number;
    x: number;
    y: number;
};
