/**
 * Widget Styles Utility
 *
 * Generates scoped CSS rules like Elementor does, using selectors
 * instead of inline styles. Each widget renders a <style> tag with
 * rules targeting its unique element ID.
 *
 * Elementor pattern:
 *   .elementor-element-{id} { text-align: center; }
 *   .elementor-element-{id} .elementor-heading-title { color: #f00; }
 */
import { CSSRule } from '../types';
export type { CSSRule };
/**
 * Generate CSS string from rules
 */
export declare function generateCSS(elementId: string, rules: CSSRule[], options?: {
    documentId?: string;
} | string): string;
/**
 * Parse dimension value (handles Elementor's { size, unit } format)
 */
export declare function parseDimension(value: any, defaultUnit?: string): string | undefined;
/**
 * Parse color value
 */
export declare function parseColor(value: any): string | undefined;
/**
 * Parse text alignment value to match Elementor's start/end format
 */
export declare function parseTextAlign(value: string | undefined): string | undefined;
/**
 * Parse typography settings into CSS properties
 */
export declare function parseTypography(settings: Record<string, any>, prefix?: string): Record<string, string | undefined>;
/**
 * Parse box shadow settings
 */
export declare function parseBoxShadow(shadow: any, settings?: Record<string, any>, prefix?: string): string | undefined;
/**
 * Parse text shadow settings
 */
export declare function parseTextShadow(shadow: any, settings?: Record<string, any>, prefix?: string): string | undefined;
/**
 * Parse text stroke settings
 */
export declare function parseTextStroke(settings: Record<string, any>, prefix?: string): Record<string, string | undefined>;
/**
 * Parse border settings
 */
export declare function parseBorder(settings: Record<string, any>, prefix?: string): Record<string, string | undefined>;
/**
 * Parse background settings
 */
export declare function parseBackground(settings: Record<string, any>, prefix?: string): Record<string, string | undefined>;
/**
 * Parse border radius
 */
export declare function parseBorderRadius(value: any): string | undefined;
/**
 * Parse padding/margin
 */
export declare function parseSpacing(value: any): string | undefined;
/**
 * Parse gap value (handles both { size, unit } and { row, column, unit } formats)
 */
export declare function parseGap(value: any): string | undefined;
/**
 * Normalize element settings
 */
export declare function normalizeSettings(settings: Record<string, any>): Record<string, any>;
/**
 * Recursively normalize all elements
 */
export declare function normalizeElements(elements: any[]): any[];
export declare const HEADING_SIZE_MAP: Record<string, string>;
export declare const BUTTON_SIZE_MAP: Record<string, {
    fontSize: string;
    padding: string;
}>;
//# sourceMappingURL=widget-styles.d.ts.map